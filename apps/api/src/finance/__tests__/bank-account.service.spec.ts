import { Test, TestingModule } from '@nestjs/testing';
import { BankAccountService } from '../services/bank-account.service';
import { DatabaseService } from '../../database/database.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AccountType } from '../dto/bank-account.dto';

describe('BankAccountService', () => {
    let service: BankAccountService;
    let mockDbService: any;

    const mockClient = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
        order: jest.fn().mockReturnThis(),
    };

    beforeEach(async () => {
        mockDbService = {
            client: mockClient,
        };

        // Reset all mocks before each test
        Object.values(mockClient).forEach((mockFn: any) => {
            if (typeof mockFn.mockReset === 'function') {
                mockFn.mockReset();
                mockFn.mockReturnThis();
            }
        });

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BankAccountService,
                {
                    provide: DatabaseService,
                    useValue: mockDbService,
                },
            ],
        }).compile();

        service = module.get<BankAccountService>(BankAccountService);
    });

    it('deve ser definido', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        const createDto = {
            name: 'Conta Corrente Principal',
            bank_name: 'Banco do Brasil',
            account_number: '12345-6',
            account_type: AccountType.CHECKING,
            initial_balance: 10000,
        };

        const tenantId = 'tenant-123';
        const userId = 'user-123';

        it('deve criar uma nova conta bancária com sucesso', async () => {
            const expectedResult = {
                id: 'uuid-123',
                ...createDto,
                current_balance: createDto.initial_balance,
                is_active: true,
                tenant_id: tenantId,
            };

            // Mock: verificar se conta já existe
            mockClient.single.mockResolvedValueOnce({ data: null, error: null });

            // Mock: inserir conta
            mockClient.single.mockResolvedValueOnce({ data: expectedResult, error: null });

            // Mock: audit log
            mockClient.insert.mockResolvedValueOnce({ data: null, error: null });

            const result = await service.create(tenantId, createDto, userId);

            expect(result.name).toBe(createDto.name);
            expect(result.current_balance).toBe(createDto.initial_balance);
        });

        it('deve lançar erro se conta já existir', async () => {
            // Mock: conta já existe
            mockClient.single.mockResolvedValueOnce({
                data: { id: 'existing-id' },
                error: null,
            });

            await expect(service.create(tenantId, createDto, userId)).rejects.toThrow(
                BadRequestException
            );
        });
    });

    describe('findAll', () => {
        const tenantId = 'tenant-123';

        it('deve listar todas as contas ativas', async () => {
            const mockAccounts = [
                { id: '1', name: 'Conta 1', is_active: true },
                { id: '2', name: 'Conta 2', is_active: true },
            ];

            mockClient.eq.mockReturnThis();
            mockClient.order.mockResolvedValueOnce({ data: mockAccounts, error: null });

            const result = await service.findAll(tenantId, false);

            expect(result).toHaveLength(2);
            expect(result[0].name).toBe('Conta 1');
        });

        it('deve retornar array vazio se não houver contas', async () => {
            mockClient.eq.mockReturnThis();
            mockClient.order.mockResolvedValueOnce({ data: [], error: null });

            const result = await service.findAll(tenantId);

            expect(result).toEqual([]);
        });
    });

    describe('findOne', () => {
        const tenantId = 'tenant-123';
        const accountId = 'account-123';

        it('deve encontrar uma conta pelo ID', async () => {
            const mockAccount = {
                id: accountId,
                name: 'Conta Corrente',
                bank_name: 'Itaú',
                current_balance: 5000,
            };

            mockClient.single.mockResolvedValueOnce({ data: mockAccount, error: null });

            const result = await service.findOne(tenantId, accountId);

            expect(result.id).toBe(accountId);
            expect(result.name).toBe('Conta Corrente');
        });

        it('deve lançar NotFoundException se conta não existir', async () => {
            mockClient.single.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } });

            await expect(service.findOne(tenantId, accountId)).rejects.toThrow(
                NotFoundException
            );
        });
    });

    describe('update', () => {
        const tenantId = 'tenant-123';
        const accountId = 'account-123';
        const userId = 'user-123';

        it('deve atualizar uma conta bancária', async () => {
            const existingAccount = {
                id: accountId,
                name: 'Conta Antiga',
                bank_name: 'Itaú',
            };

            const updateDto = { name: 'Conta Atualizada' };

            // Mock findOne
            mockClient.single.mockResolvedValueOnce({ data: existingAccount, error: null });

            // Mock update
            mockClient.single.mockResolvedValueOnce({
                data: { ...existingAccount, ...updateDto },
                error: null,
            });

            // Mock audit log
            mockClient.insert.mockResolvedValueOnce({ data: null, error: null });

            const result = await service.update(tenantId, accountId, updateDto, userId);

            expect(result.name).toBe('Conta Atualizada');
        });
    });

    describe('remove', () => {
        const tenantId = 'tenant-123';
        const accountId = 'account-123';
        const userId = 'user-123';

        it('deve excluir uma conta sem transações', async () => {
            const existingAccount = {
                id: accountId,
                name: 'Conta a Excluir',
            };

            // Mock findOne
            mockClient.single.mockResolvedValueOnce({ data: existingAccount, error: null });

            // Mock count transactions
            mockClient.select.mockReturnThis();
            mockClient.eq.mockResolvedValueOnce({ count: 0 });

            // Mock delete
            mockClient.delete.mockReturnThis();
            mockClient.eq.mockResolvedValueOnce({ error: null });

            // Mock audit log
            mockClient.insert.mockResolvedValueOnce({ data: null, error: null });

            await expect(service.remove(tenantId, accountId, userId)).resolves.not.toThrow();
        });

        it('deve lançar erro se conta tiver transações', async () => {
            const existingAccount = {
                id: accountId,
                name: 'Conta com Transações',
            };

            // Mock findOne
            mockClient.single.mockResolvedValueOnce({ data: existingAccount, error: null });

            // Mock count transactions - tem transações
            mockClient.select.mockReturnThis();
            mockClient.eq.mockResolvedValueOnce({ count: 5 });

            await expect(service.remove(tenantId, accountId, userId)).rejects.toThrow(
                BadRequestException
            );
        });
    });

    describe('getConsolidatedBalance', () => {
        const tenantId = 'tenant-123';

        it('deve calcular saldo consolidado corretamente', async () => {
            const mockAccounts = [
                { id: '1', name: 'Conta 1', current_balance: 5000, account_type: 'CHECKING' },
                { id: '2', name: 'Conta 2', current_balance: 3000, account_type: 'SAVINGS' },
            ];

            mockClient.eq.mockReturnThis();
            mockClient.eq.mockResolvedValueOnce({ data: mockAccounts, error: null });

            const result = await service.getConsolidatedBalance(tenantId);

            expect(result.total).toBe(8000);
            expect(result.byAccount).toHaveLength(2);
        });

        it('deve retornar zero se não houver contas', async () => {
            mockClient.eq.mockReturnThis();
            mockClient.eq.mockResolvedValueOnce({ data: [], error: null });

            const result = await service.getConsolidatedBalance(tenantId);

            expect(result.total).toBe(0);
            expect(result.byAccount).toEqual([]);
        });
    });
});
