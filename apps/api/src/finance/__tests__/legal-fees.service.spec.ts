import { Test, TestingModule } from '@nestjs/testing';
import { LegalFeesService } from '../legal-fees.service';
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
    range: jest.fn().mockReturnThis(),
};

describe('LegalFeesService', () => {
    let service: LegalFeesService;
    let supabase: typeof mockSupabaseClient;

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LegalFeesService,
                {
                    provide: SupabaseClient,
                    useValue: mockSupabaseClient,
                },
            ],
        }).compile();

        service = module.get<LegalFeesService>(LegalFeesService);
        supabase = module.get(SupabaseClient);
    });

    describe('create', () => {
        it('should create a new legal fee contract', async () => {
            const createDto = {
                client_id: 'client-1',
                description: 'Honorários de consultoria',
                total_value: 15000,
                payment_method: 'pix',
                due_date: '2026-02-15',
            };

            const expectedResult = {
                id: 'fee-1',
                ...createDto,
                amount_paid: 0,
                payment_status: 'pendente',
            };

            supabase.single.mockResolvedValueOnce({ data: expectedResult, error: null });

            const result = await service.create('tenant-1', createDto);

            expect(result).toEqual(expectedResult);
            expect(supabase.from).toHaveBeenCalledWith('legal_fees');
            expect(supabase.insert).toHaveBeenCalledWith(
                expect.objectContaining({
                    tenant_id: 'tenant-1',
                    client_id: createDto.client_id,
                    total_value: createDto.total_value,
                }),
            );
        });

        it('should throw error if client_id is missing', async () => {
            const invalidDto = {
                description: 'Sem cliente',
                total_value: 5000,
            };

            await expect(service.create('tenant-1', invalidDto as any)).rejects.toThrow();
        });
    });

    describe('findAll', () => {
        it('should return paginated legal fees with client data', async () => {
            const mockFees = [
                {
                    id: 'fee-1',
                    description: 'Honorário A',
                    total_value: 10000,
                    amount_paid: 5000,
                    payment_status: 'parcial_pago',
                    clients: { id: 'client-1', name: 'Cliente A' },
                },
                {
                    id: 'fee-2',
                    description: 'Honorário B',
                    total_value: 20000,
                    amount_paid: 20000,
                    payment_status: 'pago',
                    clients: { id: 'client-2', name: 'Cliente B' },
                },
            ];

            supabase.range.mockResolvedValueOnce({
                data: mockFees,
                error: null,
                count: 2,
            });

            const result = await service.findAll('tenant-1', { page: 1, pageSize: 10 });

            expect(result.items).toEqual(mockFees);
            expect(result.total).toBe(2);
        });

        it('should filter by payment status', async () => {
            supabase.range.mockResolvedValueOnce({ data: [], error: null, count: 0 });

            await service.findAll('tenant-1', { status: 'pendente' });

            expect(supabase.eq).toHaveBeenCalledWith('payment_status', 'pendente');
        });
    });

    describe('findOne', () => {
        it('should return a legal fee with payments history', async () => {
            const mockFee = {
                id: 'fee-1',
                description: 'Honorário Completo',
                total_value: 10000,
                amount_paid: 3000,
                payment_status: 'parcial_pago',
                clients: { id: 'client-1', name: 'Cliente A', email: 'a@test.com' },
                legal_fee_payments: [
                    { id: 'pay-1', amount: 2000, payment_date: '2026-01-10' },
                    { id: 'pay-2', amount: 1000, payment_date: '2026-01-15' },
                ],
            };

            supabase.single.mockResolvedValueOnce({ data: mockFee, error: null });

            const result = await service.findOne('tenant-1', 'fee-1');

            expect(result).toEqual(mockFee);
            expect(result.legal_fee_payments).toHaveLength(2);
        });
    });

    describe('registerPayment', () => {
        it('should register a payment and update amount_paid', async () => {
            const existingFee = {
                id: 'fee-1',
                total_value: 10000,
                amount_paid: 5000,
                payment_status: 'parcial_pago',
            };

            const paymentDto = {
                amount: 3000,
                payment_date: '2026-01-20',
                payment_method: 'pix',
            };

            // Mock get existing fee
            supabase.single.mockResolvedValueOnce({ data: existingFee, error: null });
            // Mock insert payment
            supabase.single.mockResolvedValueOnce({ data: { id: 'pay-1', ...paymentDto }, error: null });
            // Mock update fee
            supabase.single.mockResolvedValueOnce({
                data: {
                    ...existingFee,
                    amount_paid: 8000,
                    payment_status: 'parcial_pago',
                },
                error: null,
            });

            const result = await service.registerPayment('tenant-1', 'fee-1', paymentDto);

            expect(result.amount_paid).toBe(8000);
        });

        it('should mark as paid when total is reached', async () => {
            const existingFee = {
                id: 'fee-1',
                total_value: 10000,
                amount_paid: 7000,
                payment_status: 'parcial_pago',
            };

            const paymentDto = {
                amount: 3000, // Will complete the payment
                payment_date: '2026-01-20',
                payment_method: 'cartao_credito',
            };

            supabase.single.mockResolvedValueOnce({ data: existingFee, error: null });
            supabase.single.mockResolvedValueOnce({ data: { id: 'pay-1', ...paymentDto }, error: null });
            supabase.single.mockResolvedValueOnce({
                data: {
                    ...existingFee,
                    amount_paid: 10000,
                    payment_status: 'pago',
                },
                error: null,
            });

            const result = await service.registerPayment('tenant-1', 'fee-1', paymentDto);

            expect(result.payment_status).toBe('pago');
            expect(result.amount_paid).toBe(10000);
        });

        it('should throw error if payment exceeds pending amount', async () => {
            const existingFee = {
                id: 'fee-1',
                total_value: 10000,
                amount_paid: 9000,
            };

            const paymentDto = {
                amount: 2000, // Exceeds remaining 1000
                payment_date: '2026-01-20',
                payment_method: 'pix',
            };

            supabase.single.mockResolvedValueOnce({ data: existingFee, error: null });

            await expect(
                service.registerPayment('tenant-1', 'fee-1', paymentDto),
            ).rejects.toThrow();
        });
    });

    describe('getAnalytics', () => {
        it('should return payment analytics summary', async () => {
            const mockAnalytics = {
                total_honorarios: 50000,
                total_pago: 30000,
                total_pendente: 20000,
                taxa_pagamento: 60,
                contratos_ativos: 10,
                contratos_pagos: 5,
                contratos_atrasados: 2,
            };

            // Mock RPC call
            supabase.single.mockResolvedValueOnce({ data: mockAnalytics, error: null });

            const result = await service.getAnalytics('tenant-1', {
                startDate: '2026-01-01',
                endDate: '2026-01-31',
            });

            expect(result.total_honorarios).toBe(50000);
            expect(result.taxa_pagamento).toBe(60);
        });
    });

    describe('update', () => {
        it('should update legal fee details', async () => {
            const updateDto = {
                description: 'Descrição Atualizada',
                due_date: '2026-03-01',
            };

            const updatedFee = { id: 'fee-1', ...updateDto };
            supabase.single.mockResolvedValueOnce({ data: updatedFee, error: null });

            const result = await service.update('tenant-1', 'fee-1', updateDto);

            expect(result.description).toBe('Descrição Atualizada');
        });
    });

    describe('delete', () => {
        it('should delete a legal fee without payments', async () => {
            // Mock check for payments
            supabase.single.mockResolvedValueOnce({
                data: { id: 'fee-1', legal_fee_payments: [] },
                error: null,
            });
            supabase.eq.mockResolvedValueOnce({ error: null });

            await service.delete('tenant-1', 'fee-1');

            expect(supabase.delete).toHaveBeenCalled();
        });

        it('should throw error if fee has payments', async () => {
            supabase.single.mockResolvedValueOnce({
                data: {
                    id: 'fee-1',
                    legal_fee_payments: [{ id: 'pay-1' }],
                },
                error: null,
            });

            await expect(service.delete('tenant-1', 'fee-1')).rejects.toThrow();
        });
    });
});
