import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksController } from '../webhooks.controller';
import { StripePaymentService } from '../services/stripe-payment.service';
import { AsaasPaymentService } from '../services/asaas-payment.service';
import { EmailService } from '../services/email.service';
import { SupabaseClient } from '@supabase/supabase-js';

// Mock Supabase Client
const mockSupabaseClient = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
};

// Mock Services
const mockStripeService = {
    processWebhook: jest.fn(),
};

const mockAsaasService = {
    processWebhook: jest.fn(),
};

const mockEmailService = {
    sendPaymentConfirmation: jest.fn(),
    sendPaymentFailed: jest.fn(),
    sendPaymentReminder: jest.fn(),
};

describe('WebhooksController', () => {
    let controller: WebhooksController;

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            controllers: [WebhooksController],
            providers: [
                { provide: StripePaymentService, useValue: mockStripeService },
                { provide: AsaasPaymentService, useValue: mockAsaasService },
                { provide: EmailService, useValue: mockEmailService },
                { provide: SupabaseClient, useValue: mockSupabaseClient },
            ],
        }).compile();

        controller = module.get<WebhooksController>(WebhooksController);
    });

    describe('handleStripeWebhook', () => {
        it('should process valid Stripe webhook', async () => {
            const mockRequest = {
                rawBody: Buffer.from('{}'),
            } as any;

            mockStripeService.processWebhook.mockResolvedValueOnce({
                success: true,
                eventType: 'payment_intent.succeeded',
                data: {
                    honorarioId: 'hon-1',
                    amount: 10000,
                    clienteEmail: 'test@example.com',
                },
            });

            mockSupabaseClient.single.mockResolvedValue({ data: {}, error: null });
            mockEmailService.sendPaymentConfirmation.mockResolvedValue(true);

            const result = await controller.handleStripeWebhook(mockRequest, 'sig_test');

            expect(result.received).toBe(true);
            expect(mockStripeService.processWebhook).toHaveBeenCalled();
        });

        it('should update database on successful payment', async () => {
            const mockRequest = { rawBody: Buffer.from('{}') } as any;

            mockStripeService.processWebhook.mockResolvedValueOnce({
                success: true,
                eventType: 'payment_intent.succeeded',
                data: {
                    honorarioId: 'hon-1',
                    amount: 10000,
                    paymentId: 'pi_123',
                },
            });

            mockSupabaseClient.single.mockResolvedValue({ data: {}, error: null });

            await controller.handleStripeWebhook(mockRequest, 'sig_test');

            expect(mockSupabaseClient.from).toHaveBeenCalledWith('legal_fee_payments');
            expect(mockSupabaseClient.insert).toHaveBeenCalled();
        });

        it('should send confirmation email on successful payment', async () => {
            const mockRequest = { rawBody: Buffer.from('{}') } as any;

            mockStripeService.processWebhook.mockResolvedValueOnce({
                success: true,
                eventType: 'payment_intent.succeeded',
                data: {
                    honorarioId: 'hon-1',
                    amount: 10000,
                    clienteEmail: 'test@example.com',
                    clienteNome: 'Test User',
                },
            });

            mockSupabaseClient.single.mockResolvedValue({ data: {}, error: null });

            await controller.handleStripeWebhook(mockRequest, 'sig_test');

            expect(mockEmailService.sendPaymentConfirmation).toHaveBeenCalledWith(
                'test@example.com',
                expect.any(Object),
            );
        });

        it('should handle payment failure event', async () => {
            const mockRequest = { rawBody: Buffer.from('{}') } as any;

            mockStripeService.processWebhook.mockResolvedValueOnce({
                success: true,
                eventType: 'payment_intent.payment_failed',
                data: {
                    honorarioId: 'hon-1',
                    clienteEmail: 'test@example.com',
                },
            });

            await controller.handleStripeWebhook(mockRequest, 'sig_test');

            expect(mockEmailService.sendPaymentFailed).toHaveBeenCalled();
        });

        it('should return error on invalid signature', async () => {
            const mockRequest = { rawBody: Buffer.from('{}') } as any;

            mockStripeService.processWebhook.mockResolvedValueOnce({
                success: false,
                errorMessage: 'Invalid signature',
            });

            const result = await controller.handleStripeWebhook(mockRequest, 'bad_sig');

            expect(result.received).toBe(true);
            // Should still acknowledge receipt to prevent retries
        });
    });

    describe('handleAsaasWebhook', () => {
        it('should process valid Asaas webhook', async () => {
            const mockRequest = {
                rawBody: Buffer.from(JSON.stringify({
                    event: 'PAYMENT_RECEIVED',
                    payment: {
                        id: 'pay_123',
                        value: 500,
                    },
                })),
            } as any;

            mockAsaasService.processWebhook.mockResolvedValueOnce({
                success: true,
                eventType: 'PAYMENT_RECEIVED',
                data: {
                    honorarioId: 'hon-1',
                    amount: 50000, // In cents
                },
            });

            mockSupabaseClient.single.mockResolvedValue({ data: {}, error: null });

            const result = await controller.handleAsaasWebhook(mockRequest, 'token_test');

            expect(result.received).toBe(true);
            expect(mockAsaasService.processWebhook).toHaveBeenCalled();
        });

        it('should handle PAYMENT_CONFIRMED event', async () => {
            const mockRequest = { rawBody: Buffer.from('{}') } as any;

            mockAsaasService.processWebhook.mockResolvedValueOnce({
                success: true,
                eventType: 'PAYMENT_CONFIRMED',
                data: {
                    honorarioId: 'hon-1',
                    amount: 30000,
                },
            });

            mockSupabaseClient.single.mockResolvedValue({ data: {}, error: null });

            await controller.handleAsaasWebhook(mockRequest, 'token_test');

            expect(mockSupabaseClient.from).toHaveBeenCalledWith('legal_fee_payments');
        });

        it('should handle PAYMENT_OVERDUE event', async () => {
            const mockRequest = { rawBody: Buffer.from('{}') } as any;

            mockAsaasService.processWebhook.mockResolvedValueOnce({
                success: true,
                eventType: 'PAYMENT_OVERDUE',
                data: {
                    honorarioId: 'hon-1',
                },
            });

            await controller.handleAsaasWebhook(mockRequest, 'token_test');

            // Should update status to 'atrasado'
            expect(mockSupabaseClient.update).toHaveBeenCalledWith(
                expect.objectContaining({ payment_status: 'atrasado' }),
            );
        });

        it('should verify Asaas webhook token', async () => {
            const mockRequest = { rawBody: Buffer.from('{}') } as any;

            mockAsaasService.processWebhook.mockResolvedValueOnce({
                success: false,
                errorMessage: 'Invalid token',
            });

            const result = await controller.handleAsaasWebhook(mockRequest, 'invalid_token');

            expect(result.received).toBe(true);
        });
    });

    describe('Error Handling', () => {
        it('should handle missing rawBody gracefully', async () => {
            const mockRequest = {} as any;

            await expect(
                controller.handleStripeWebhook(mockRequest, 'sig_test'),
            ).resolves.not.toThrow();
        });

        it('should log errors but not throw', async () => {
            const mockRequest = { rawBody: Buffer.from('{}') } as any;

            mockStripeService.processWebhook.mockRejectedValueOnce(new Error('Network error'));

            const result = await controller.handleStripeWebhook(mockRequest, 'sig_test');

            // Should acknowledge to prevent Stripe retries
            expect(result).toBeDefined();
        });
    });
});
