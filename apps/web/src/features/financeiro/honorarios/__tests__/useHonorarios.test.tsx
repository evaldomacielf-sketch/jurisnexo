import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useHonorarios,
  useHonorarioDetails,
  useCreateHonorario,
  useRegistrarPagamentoHonorario,
} from '../hooks/useHonorarios';
import { financeiroApi } from '@/services/api/financeiro.service';

// Mock the API service
vi.mock('@/services/api/financeiro.service', () => ({
  financeiroApi: {
    getHonorarios: vi.fn(),
    getHonorarioById: vi.fn(),
    createHonorario: vi.fn(),
    updateHonorario: vi.fn(),
    deleteHonorario: vi.fn(),
    registrarPagamentoHonorario: vi.fn(),
  },
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}> {children} </QueryClientProvider>
  );
  Wrapper.displayName = 'QueryClientWrapper';
  return Wrapper;
};

describe('useHonorarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('useHonorarios - List', () => {
    it('should fetch honorarios list', async () => {
      const mockData = {
        items: [
          { id: 'hon-1', descricao: 'Honorário A', valor_total: 10000 },
          { id: 'hon-2', descricao: 'Honorário B', valor_total: 20000 },
        ],
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      };

      vi.mocked(financeiroApi.getHonorarios).mockResolvedValueOnce(mockData);

      const { result } = renderHook(() => useHonorarios(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockData);
      expect(financeiroApi.getHonorarios).toHaveBeenCalledTimes(1);
    });

    it('should pass filters to API', async () => {
      const mockData = { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
      vi.mocked(financeiroApi.getHonorarios).mockResolvedValueOnce(mockData);

      const filters = { status: 'pendente', page: 2 };

      renderHook(() => useHonorarios(filters), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(financeiroApi.getHonorarios).toHaveBeenCalledWith(filters);
      });
    });

    it('should handle fetch error', async () => {
      const error = new Error('Network error');
      vi.mocked(financeiroApi.getHonorarios).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useHonorarios(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeDefined();
    });
  });

  describe('useHonorarioDetails', () => {
    it('should fetch honorario details', async () => {
      const mockHonorario = {
        id: 'hon-1',
        descricao: 'Honorário Teste',
        valor_total: 10000,
        valor_pago: 5000,
        cliente: { id: 'cli-1', nome: 'Cliente' },
        pagamentos: [{ id: 'pay-1', amount: 5000 }],
      };

      vi.mocked(financeiroApi.getHonorarioById).mockResolvedValueOnce(mockHonorario);

      const { result } = renderHook(() => useHonorarioDetails('hon-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockHonorario);
      expect(financeiroApi.getHonorarioById).toHaveBeenCalledWith('hon-1');
    });

    it('should not fetch when id is empty', async () => {
      const { result } = renderHook(() => useHonorarioDetails(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isFetching).toBe(false);
      expect(financeiroApi.getHonorarioById).not.toHaveBeenCalled();
    });
  });

  describe('useCreateHonorario', () => {
    it('should create honorario successfully', async () => {
      const newHonorario = {
        client_id: 'cli-1',
        descricao: 'Novo Honorário',
        valor_total: 15000,
      };

      const createdHonorario = {
        id: 'new-hon-1',
        ...newHonorario,
        valor_pago: 0,
        status: 'pendente',
      };

      vi.mocked(financeiroApi.createHonorario).mockResolvedValueOnce(createdHonorario);

      const queryClient = createTestQueryClient();
      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}> {children} </QueryClientProvider>
      );

      const { result } = renderHook(() => useCreateHonorario(), { wrapper });

      await result.current.mutateAsync(newHonorario);

      expect(financeiroApi.createHonorario).toHaveBeenCalledWith(newHonorario);
    });

    it('should invalidate queries on success', async () => {
      vi.mocked(financeiroApi.createHonorario).mockResolvedValueOnce({ id: 'new' });

      const queryClient = createTestQueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}> {children} </QueryClientProvider>
      );

      const { result } = renderHook(() => useCreateHonorario(), { wrapper });

      await result.current.mutateAsync({ descricao: 'Test' });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['honorarios'] });
    });
  });

  describe('useRegistrarPagamentoHonorario', () => {
    it('should register payment successfully', async () => {
      const paymentData = {
        amount: 5000,
        payment_date: '2026-01-20',
        payment_method: 'pix',
      };

      const updatedHonorario = {
        id: 'hon-1',
        valor_total: 10000,
        valor_pago: 5000,
        status: 'parcial_pago',
      };

      vi.mocked(financeiroApi.registrarPagamentoHonorario).mockResolvedValueOnce(updatedHonorario);

      const queryClient = createTestQueryClient();
      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}> {children} </QueryClientProvider>
      );

      const { result } = renderHook(() => useRegistrarPagamentoHonorario(), { wrapper });

      await result.current.mutateAsync({
        id: 'hon-1',
        data: paymentData,
      });

      expect(financeiroApi.registrarPagamentoHonorario).toHaveBeenCalledWith('hon-1', paymentData);
    });

    it('should invalidate honorario queries on success', async () => {
      vi.mocked(financeiroApi.registrarPagamentoHonorario).mockResolvedValueOnce({});

      const queryClient = createTestQueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}> {children} </QueryClientProvider>
      );

      const { result } = renderHook(() => useRegistrarPagamentoHonorario(), { wrapper });

      await result.current.mutateAsync({ id: 'hon-1', data: { amount: 1000 } });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['honorarios'] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['honorario'] });
    });

    it('should handle payment error', async () => {
      const error = { response: { data: { message: 'Valor excede pendente' } } };
      vi.mocked(financeiroApi.registrarPagamentoHonorario).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useRegistrarPagamentoHonorario(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.mutateAsync({ id: 'hon-1', data: { amount: 999999 } })
      ).rejects.toEqual(error);
    });
  });
});
