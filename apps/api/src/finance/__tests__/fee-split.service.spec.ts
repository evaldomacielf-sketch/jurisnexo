import { Test, TestingModule } from '@nestjs/testing';
import { FeeSplitService } from '../services/fee-split.service';
import { SupabaseClient } from '@supabase/supabase-js';

// Mock Supabase Client
const mockSupabaseClient = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    order: jest.fn().mockReturnThis(),
};

describe('FeeSplitService', () => {
    let service: FeeSplitService;
    let supabase: typeof mockSupabaseClient;

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FeeSplitService,
                {
                    provide: SupabaseClient,
                    useValue: mockSupabaseClient,
                },
            ],
        }).compile();

        service = module.get<FeeSplitService>(FeeSplitService);
        supabase = module.get(SupabaseClient);
    });

    describe('create', () => {
        it('should create a new fee split rule', async () => {
            const createDto = {
                nome: 'Regra 50/50',
                tipo_divisao: 'percentual' as const,
                advogados: [
                    { advogado_id: 'adv-1', percentual: 50 },
                    { advogado_id: 'adv-2', percentual: 50 },
                ],
            };

            const expectedResult = { id: 'rule-1', ...createDto };

            supabase.insert.mockReturnThis();
            supabase.select.mockReturnThis();
            supabase.single.mockResolvedValueOnce({ data: expectedResult, error: null });

            const result = await service.create('tenant-1', createDto);

            expect(result).toEqual(expectedResult);
            expect(supabase.from).toHaveBeenCalledWith('fee_split_rules');
        });

        it('should throw error if total percentage exceeds 100', async () => {
            const invalidDto = {
                nome: 'Regra Inválida',
                tipo_divisao: 'percentual' as const,
                advogados: [
                    { advogado_id: 'adv-1', percentual: 60 },
                    { advogado_id: 'adv-2', percentual: 50 }, // Total = 110%
                ],
            };

            await expect(service.create('tenant-1', invalidDto)).rejects.toThrow();
        });
    });

    describe('calculateSplit', () => {
        it('should calculate percentage-based split correctly', () => {
            const rule = {
                tipo_divisao: 'percentual',
                advogados: [
                    { advogado_id: 'adv-1', percentual: 60 },
                    { advogado_id: 'adv-2', percentual: 40 },
                ],
            };

            const valor = 10000; // R$ 10.000,00
            const result = service.calculateSplit(rule as any, valor);

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({ advogado_id: 'adv-1', valor: 6000 });
            expect(result[1]).toEqual({ advogado_id: 'adv-2', valor: 4000 });
        });

        it('should calculate fixed-value split correctly', () => {
            const rule = {
                tipo_divisao: 'fixo',
                advogados: [
                    { advogado_id: 'adv-1', valor_fixo: 3000 },
                    { advogado_id: 'adv-2', valor_fixo: 2000 },
                ],
            };

            const valor = 10000;
            const result = service.calculateSplit(rule as any, valor);

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({ advogado_id: 'adv-1', valor: 3000 });
            expect(result[1]).toEqual({ advogado_id: 'adv-2', valor: 2000 });
        });

        it('should calculate progressive split correctly', () => {
            const rule = {
                tipo_divisao: 'progressivo',
                advogados: [
                    {
                        advogado_id: 'adv-1',
                        condicoes_progressivas: [
                            { min_valor: 0, max_valor: 5000, percentual: 30 },
                            { min_valor: 5000, max_valor: null, percentual: 50 },
                        ],
                    },
                ],
            };

            // Valor de R$ 10.000
            // Primeiros R$ 5.000 = 30% = R$ 1.500
            // Próximos R$ 5.000 = 50% = R$ 2.500
            // Total = R$ 4.000

            const result = service.calculateSplit(rule as any, 10000);
            expect(result[0].valor).toBe(4000);
        });
    });

    describe('findAll', () => {
        it('should return paginated fee split rules', async () => {
            const mockRules = [
                { id: 'rule-1', nome: 'Regra A', tipo_divisao: 'percentual' },
                { id: 'rule-2', nome: 'Regra B', tipo_divisao: 'fixo' },
            ];

            supabase.order.mockResolvedValueOnce({
                data: mockRules,
                error: null,
                count: 2,
            });

            const result = await service.findAll('tenant-1', { page: 1, pageSize: 10 });

            expect(result.items).toEqual(mockRules);
            expect(supabase.from).toHaveBeenCalledWith('fee_split_rules');
        });
    });

    describe('findOne', () => {
        it('should return a single fee split rule', async () => {
            const mockRule = {
                id: 'rule-1',
                nome: 'Regra Teste',
                tipo_divisao: 'percentual',
                advogados: [],
            };

            supabase.single.mockResolvedValueOnce({ data: mockRule, error: null });

            const result = await service.findOne('tenant-1', 'rule-1');

            expect(result).toEqual(mockRule);
        });

        it('should throw when rule not found', async () => {
            supabase.single.mockResolvedValueOnce({
                data: null,
                error: { code: 'PGRST116', message: 'Not found' },
            });

            await expect(service.findOne('tenant-1', 'non-existent')).rejects.toThrow();
        });
    });

    describe('update', () => {
        it('should update a fee split rule', async () => {
            const updateDto = { nome: 'Regra Atualizada' };
            const updatedRule = { id: 'rule-1', ...updateDto };

            supabase.single.mockResolvedValueOnce({ data: updatedRule, error: null });

            const result = await service.update('tenant-1', 'rule-1', updateDto);

            expect(result).toEqual(updatedRule);
            expect(supabase.update).toHaveBeenCalledWith(updateDto);
        });
    });

    describe('delete', () => {
        it('should delete a fee split rule', async () => {
            supabase.delete.mockReturnThis();
            supabase.eq.mockResolvedValueOnce({ error: null });

            await service.delete('tenant-1', 'rule-1');

            expect(supabase.from).toHaveBeenCalledWith('fee_split_rules');
            expect(supabase.delete).toHaveBeenCalled();
        });
    });
});
