import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StripePaymentService } from '../services/stripe-payment.service';

// Mock Stripe
jest.mock('stripe', () => {
    return jest.fn().mockImplementation(() => ({
        paymentIntents: {
            create: jest.fn(),
            retrieve: jest.fn(),
            cancel: jest.fn(),
        },
        checkout: {
            sessions: {
                create: jest.fn(),
            },
        },
        refunds: {
            create: jest.fn(),
        },
        webhooks: {
            constructEvent: jest.fn(),
        },
    }));
});

describe('StripePaymentService', () => {
    let service: StripePaymentService;
    let mockConfigService: any;

    beforeEach(async () => {
        mockConfigService = {
            get: jest.fn((key: string) => {
                const config: Record<string, string> = {
                    STRIPE_SECRET_KEY: 'sk_test_123',
                    STRIPE_WEBHOOK_SECRET: 'whsec_123',
                    STRIPE_SUCCESS_URL: 'https://app.test/success',
                    STRIPE_CANCEL_URL: 'https://app.test/cancel',
                };
                return config[key];
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StripePaymentService,
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        service = module.get<StripePaymentService>(StripePaymentService);
    });

    describe('createPaymentIntent', () => {
        it('should create a payment intent successfully', async () => {
            const mockPaymentIntent = {
                id: 'pi_test_123',
                status: 'requires_payment_method',
                client_secret: 'secret_123',
            };

            (service as any).stripe.paymentIntents.create.mockResolvedValueOnce(mockPaymentIntent);

            const result = await service.createPaymentIntent({
                escritorioId: 'esc-1',
                clienteId: 'cli-1',
                valor: 10000,
                metodoPagamento: 'cartao_credito',
            });

            expect(result.success).toBe(true);
            expect(result.paymentId).toBe('pi_test_123');
        });

        it('should handle payment intent creation failure', async () => {
            (service as any).stripe.paymentIntents.create.mockRejectedValueOnce(
                new Error('Card declined'),
            );

            const result = await service.createPaymentIntent({
                escritorioId: 'esc-1',
                clienteId: 'cli-1',
                valor: 10000,
                metodoPagamento: 'cartao_credito',
            });

            expect(result.success).toBe(false);
            expect(result.errorMessage).toContain('Card declined');
        });
    });

    describe('createCheckoutSession', () => {
        it('should create a checkout session successfully', async () => {
            const mockSession = {
                id: 'cs_test_123',
                url: 'https://checkout.stripe.com/session_123',
            };

            (service as any).stripe.checkout.sessions.create.mockResolvedValueOnce(mockSession);

            const result = await service.createCheckoutSession({
                escritorioId: 'esc-1',
                clienteId: 'cli-1',
                clienteEmail: 'test@example.com',
                honorarioId: 'hon-1',
                valor: 15000,
                descricao: 'Honorários de consultoria',
            });

            expect(result.success).toBe(true);
            expect(result.sessionId).toBe('cs_test_123');
            expect(result.checkoutUrl).toBe('https://checkout.stripe.com/session_123');
        });

        it('should include correct metadata in checkout session', async () => {
            const mockSession = { id: 'cs_test_123', url: 'https://test.com' };
            (service as any).stripe.checkout.sessions.create.mockResolvedValueOnce(mockSession);

            await service.createCheckoutSession({
                escritorioId: 'esc-1',
                clienteId: 'cli-1',
                clienteEmail: 'test@example.com',
                honorarioId: 'hon-1',
                valor: 10000,
                descricao: 'Test',
            });

            expect((service as any).stripe.checkout.sessions.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    metadata: expect.objectContaining({
                        escritorioId: 'esc-1',
                        honorarioId: 'hon-1',
                    }),
                }),
            );
        });
    });

    describe('getPaymentStatus', () => {
        it('should retrieve payment status', async () => {
            const mockIntent = {
                id: 'pi_test_123',
                status: 'succeeded',
                amount: 10000,
            };

            (service as any).stripe.paymentIntents.retrieve.mockResolvedValueOnce(mockIntent);

            const result = await service.getPaymentStatus('pi_test_123');

            expect(result.status).toBe('succeeded');
            expect(result.amount).toBe(10000);
        });

        it('should map Stripe status to internal status', async () => {
            const testCases = [
                { stripeStatus: 'succeeded', expected: 'pago' },
                { stripeStatus: 'processing', expected: 'processando' },
                { stripeStatus: 'requires_payment_method', expected: 'pendente' },
                { stripeStatus: 'canceled', expected: 'cancelado' },
            ];

            for (const testCase of testCases) {
                (service as any).stripe.paymentIntents.retrieve.mockResolvedValueOnce({
                    id: 'pi_test',
                    status: testCase.stripeStatus,
                    amount: 1000,
                });

                const result = await service.getPaymentStatus('pi_test');
                expect(result.mappedStatus).toBe(testCase.expected);
            }
        });
    });

    describe('cancelPayment', () => {
        it('should cancel a pending payment', async () => {
            const mockCanceled = {
                id: 'pi_test_123',
                status: 'canceled',
            };

            (service as any).stripe.paymentIntents.cancel.mockResolvedValueOnce(mockCanceled);

            const result = await service.cancelPayment('pi_test_123');

            expect(result.success).toBe(true);
        });
    });

    describe('refundPayment', () => {
        it('should create a full refund', async () => {
            const mockRefund = {
                id: 're_test_123',
                status: 'succeeded',
                amount: 10000,
            };

            (service as any).stripe.refunds.create.mockResolvedValueOnce(mockRefund);

            const result = await service.refundPayment({
                paymentId: 'pi_test_123',
            });

            expect(result.success).toBe(true);
            expect(result.refundId).toBe('re_test_123');
        });

        it('should create a partial refund', async () => {
            const mockRefund = {
                id: 're_test_123',
                status: 'succeeded',
                amount: 5000,
            };

            (service as any).stripe.refunds.create.mockResolvedValueOnce(mockRefund);

            const result = await service.refundPayment({
                paymentId: 'pi_test_123',
                amount: 5000,
            });

            expect(result.success).toBe(true);
            expect(result.amount).toBe(5000);
        });
    });

    describe('processWebhook', () => {
        it('should process payment_intent.succeeded event', async () => {
            const mockEvent = {
                type: 'payment_intent.succeeded',
                data: {
                    object: {
                        id: 'pi_test_123',
                        amount: 10000,
                        metadata: {
                            honorarioId: 'hon-1',
                            escritorioId: 'esc-1',
                        },
                    },
                },
            };

            (service as any).stripe.webhooks.constructEvent.mockReturnValueOnce(mockEvent);

            const result = await service.processWebhook('payload', 'sig_123');

            expect(result.success).toBe(true);
            expect(result.eventType).toBe('payment_intent.succeeded');
            expect(result.data.honorarioId).toBe('hon-1');
        });

        it('should process checkout.session.completed event', async () => {
            const mockEvent = {
                type: 'checkout.session.completed',
                data: {
                    object: {
                        id: 'cs_test_123',
                        payment_intent: 'pi_test_123',
                        metadata: {
                            honorarioId: 'hon-1',
                        },
                    },
                },
            };

            (service as any).stripe.webhooks.constructEvent.mockReturnValueOnce(mockEvent);

            const result = await service.processWebhook('payload', 'sig_123');

            expect(result.success).toBe(true);
            expect(result.eventType).toBe('checkout.session.completed');
        });

        it('should reject invalid webhook signature', async () => {
            (service as any).stripe.webhooks.constructEvent.mockImplementation(() => {
                throw new Error('Invalid signature');
            });

            const result = await service.processWebhook('payload', 'invalid_sig');

            expect(result.success).toBe(false);
            expect(result.errorMessage).toContain('Invalid signature');
        });
    });
});
