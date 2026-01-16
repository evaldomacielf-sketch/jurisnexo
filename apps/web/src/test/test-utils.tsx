import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, ReactElement } from 'react';
import { Toaster } from 'react-hot-toast';

// Create a new QueryClient for each test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  });

interface WrapperProps {
  children: ReactNode;
}

/**
 * Custom render function that wraps components with all necessary providers.
 * Use this instead of @testing-library/react's render for component tests.
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult & { queryClient: QueryClient } {
  const queryClient = createTestQueryClient();

  const Wrapper = ({ children }: WrapperProps) => (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
    </QueryClientProvider>
  );

  const result = render(ui, { wrapper: Wrapper, ...options });

  return {
    ...result,
    queryClient,
  };
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react';
export { userEvent } from '@testing-library/user-event';

// Override render with our custom render
export { customRender as render };

/**
 * Helper to wait for React Query mutations to complete.
 */
export async function waitForMutation(queryClient: QueryClient, timeout = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const checkMutations = () => {
      const isMutating = queryClient.isMutating() > 0;

      if (!isMutating) {
        resolve();
        return;
      }

      if (Date.now() - startTime > timeout) {
        reject(new Error('Mutation timeout'));
        return;
      }

      setTimeout(checkMutations, 50);
    };

    checkMutations();
  });
}

/**
 * Mock data factories for tests.
 */
export const factories = {
  honorario: (overrides = {}) => ({
    id: 'hon-test-1',
    escritorio_id: 'esc-1',
    cliente_id: 'cli-1',
    descricao: 'Honorários de Teste',
    valor_total: 10000,
    valor_pago: 0,
    valor_pendente: 10000,
    data_vencimento: '2026-02-15',
    status: 'pendente',
    created_at: new Date().toISOString(),
    cliente: {
      id: 'cli-1',
      nome: 'Cliente Teste',
      email: 'teste@example.com',
    },
    pagamentos: [],
    ...overrides,
  }),

  feeSplitRule: (overrides = {}) => ({
    id: 'rule-test-1',
    escritorio_id: 'esc-1',
    nome: 'Regra de Teste',
    tipo_divisao: 'percentual',
    advogados: [
      { advogado_id: 'adv-1', percentual: 60 },
      { advogado_id: 'adv-2', percentual: 40 },
    ],
    status: 'ativa',
    created_at: new Date().toISOString(),
    ...overrides,
  }),

  checkoutSession: (overrides = {}) => ({
    id: 'session-test-1',
    escritorio_id: 'esc-1',
    cliente_id: 'cli-1',
    honorario_id: 'hon-1',
    valor: 5000,
    gateway: 'stripe',
    checkout_url: 'https://checkout.stripe.com/test',
    status: 'pendente',
    created_at: new Date().toISOString(),
    ...overrides,
  }),

  payment: (overrides = {}) => ({
    id: 'pay-test-1',
    legal_fee_id: 'hon-1',
    amount: 5000,
    payment_date: '2026-01-15',
    payment_method: 'pix',
    notes: 'Pagamento via PIX',
    ...overrides,
  }),
};

/**
 * Mock API responses for MSW handlers.
 */
export const mockResponses = {
  success: (data: any) => ({
    success: true,
    data,
    message: 'Operação realizada com sucesso',
  }),

  error: (message: string, statusCode = 400) => ({
    success: false,
    data: null,
    message,
    statusCode,
  }),

  paginated: (items: any[], total = items.length) => ({
    items,
    total,
    page: 1,
    pageSize: 10,
    totalPages: Math.ceil(total / 10),
  }),
};
