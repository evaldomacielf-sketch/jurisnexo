import { http, HttpResponse } from 'msw';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

/**
 * MSW handlers for mocking API endpoints in tests.
 * Import and use with setupServer() for integration tests.
 */
export const handlers = [
  // ================== HONORARIOS ==================

  // GET /finance/legal-fees
  http.get(`${API_URL}/finance/legal-fees`, () => {
    return HttpResponse.json({
      items: [
        {
          id: 'hon-1',
          descricao: 'Honorários de consultoria',
          valor_total: 15000,
          valor_pago: 5000,
          status: 'parcial_pago',
          cliente: { id: 'cli-1', nome: 'Cliente A' },
        },
        {
          id: 'hon-2',
          descricao: 'Honorários de processo',
          valor_total: 20000,
          valor_pago: 20000,
          status: 'pago',
          cliente: { id: 'cli-2', nome: 'Cliente B' },
        },
      ],
      total: 2,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });
  }),

  // GET /finance/legal-fees/:id
  http.get(`${API_URL}/finance/legal-fees/:id`, ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      id,
      descricao: 'Honorários de teste',
      valor_total: 10000,
      valor_pago: 3000,
      valor_pendente: 7000,
      status: 'parcial_pago',
      data_vencimento: '2026-02-15',
      cliente: {
        id: 'cli-1',
        nome: 'Cliente Teste',
        email: 'teste@example.com',
      },
      pagamentos: [
        {
          id: 'pay-1',
          amount: 2000,
          payment_date: '2026-01-10',
          payment_method: 'pix',
        },
        {
          id: 'pay-2',
          amount: 1000,
          payment_date: '2026-01-12',
          payment_method: 'cartao_credito',
        },
      ],
    });
  }),

  // POST /finance/legal-fees
  http.post(`${API_URL}/finance/legal-fees`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      {
        id: 'new-hon-1',
        ...body,
        valor_pago: 0,
        status: 'pendente',
        created_at: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  // POST /finance/legal-fees/:id/payments
  http.post(`${API_URL}/finance/legal-fees/:id/payments`, async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as any;
    return HttpResponse.json({
      id,
      valor_pago: body.amount,
      status: 'parcial_pago',
    });
  }),

  // ================== FEE SPLIT ==================

  // GET /finance/fee-split
  http.get(`${API_URL}/finance/fee-split`, () => {
    return HttpResponse.json({
      items: [
        {
          id: 'rule-1',
          nome: 'Regra 60/40',
          tipo_divisao: 'percentual',
          advogados: [
            { advogado_id: 'adv-1', percentual: 60 },
            { advogado_id: 'adv-2', percentual: 40 },
          ],
          status: 'ativa',
        },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });
  }),

  // POST /finance/fee-split
  http.post(`${API_URL}/finance/fee-split`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      {
        id: 'new-rule-1',
        ...body,
        status: 'ativa',
        created_at: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  // ================== PAYMENT PORTAL ==================

  // POST /finance/payment-portal/checkout
  http.post(`${API_URL}/finance/payment-portal/checkout`, async ({ request }) => {
    const body = (await request.json()) as any;
    const isPix = body.metodo_pagamento === 'pix';

    return HttpResponse.json({
      success: true,
      sessionId: 'session-123',
      checkout_url: isPix ? null : 'https://checkout.stripe.com/session_123',
      qr_code_pix: isPix ? 'data:image/png;base64,ABC123' : null,
      pix_copy_paste: isPix ? '00020101021226890014br.gov.bcb.pix...' : null,
    });
  }),

  // GET /finance/payment-portal/checkout/:id/status
  http.get(`${API_URL}/finance/payment-portal/checkout/:id/status`, ({ params }) => {
    return HttpResponse.json({
      sessionId: params.id,
      status: 'pendente',
      valor: 5000,
      expires_at: new Date(Date.now() + 3600000).toISOString(),
    });
  }),

  // ================== ANALYTICS ==================

  // GET /finance/legal-fees/analytics
  http.get(`${API_URL}/finance/legal-fees/analytics`, () => {
    return HttpResponse.json({
      total_honorarios: 150000,
      total_pago: 95000,
      total_pendente: 55000,
      taxa_pagamento: 63.33,
      contratos_ativos: 25,
      contratos_pagos: 18,
      contratos_atrasados: 3,
    });
  }),

  // ================== ERROR HANDLERS ==================

  // 404 handler
  http.get(`${API_URL}/finance/legal-fees/not-found`, () => {
    return HttpResponse.json({ message: 'Honorário não encontrado' }, { status: 404 });
  }),

  // 500 handler
  http.get(`${API_URL}/finance/error`, () => {
    return HttpResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }),
];

/**
 * Handlers for simulating specific scenarios.
 */
export const scenarioHandlers = {
  // Empty list
  emptyHonorarios: http.get(`${API_URL}/finance/legal-fees`, () => {
    return HttpResponse.json({
      items: [],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
    });
  }),

  // Payment success
  paymentSuccess: http.post(`${API_URL}/finance/payment-portal/checkout`, () => {
    return HttpResponse.json({
      success: true,
      sessionId: 'success-session',
      checkout_url: 'https://checkout.stripe.com/success',
    });
  }),

  // Payment failure
  paymentFailure: http.post(`${API_URL}/finance/payment-portal/checkout`, () => {
    return HttpResponse.json({ success: false, message: 'Pagamento recusado' }, { status: 402 });
  }),

  // Network error simulation
  networkError: http.get(`${API_URL}/finance/legal-fees`, () => {
    return HttpResponse.error();
  }),
};
