import axios, { AxiosInstance } from 'axios';
import { QueryClient } from '@tanstack/react-query';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class FinanceiroApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para adicionar token
    this.api.interceptors.request.use((config) => {
      // Check both storage keys to be safe, typically it's access_token or auth_token
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Interceptor para tratamento de erros
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            // Optional: specific logic or redirect, but be careful with loops
            // window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // ==================== LIVRO CAIXA ====================

  async getLivroCaixaEntries(filters: any) {
    // Mapping frontend request to actual backend paths based on previous file
    // Previous file used: /finance/cash-book
    const response = await this.api.get('/finance/cash-book', { params: filters });
    return response.data;
  }

  async createLivroCaixaEntry(data: any) {
    const response = await this.api.post('/finance/cash-book', data);
    return response.data;
  }

  async updateLivroCaixaEntry(id: string, data: any) {
    const response = await this.api.patch(`/finance/cash-book/${id}`, data);
    return response.data;
  }

  async deleteLivroCaixaEntry(id: string) {
    const response = await this.api.delete(`/finance/cash-book/${id}`);
    return response.data;
  }

  async getRelatorioFiscal(params: any) {
    const response = await this.api.get('/finance/cash-book/fiscal-report', { params });
    return response.data;
  }

  async exportarLivroCaixa(formato: 'pdf' | 'excel', filters: any) {
    const response = await this.api.post(
      '/finance/cash-book/export',
      { formato, filtros: filters },
      { responseType: 'blob' }
    );
    return response.data;
  }

  // ==================== FEE SPLIT ====================

  async getRegrasFeeSplit() {
    const response = await this.api.get('/finance/fee-splits/rules');
    return response.data;
  }

  async createRegraFeeSplit(data: any) {
    const response = await this.api.post('/finance/fee-splits/rules', data);
    return response.data;
  }

  async updateRegraFeeSplit(id: string, data: any) {
    const response = await this.api.put(`/finance/fee-splits/rules/${id}`, data);
    return response.data;
  }

  async deleteRegraFeeSplit(id: string) {
    const response = await this.api.delete(`/finance/fee-splits/rules/${id}`);
    return response.data;
  }

  async calcularDivisao(honorarioId: string, regraId: string) {
    const response = await this.api.post('/finance/fee-splits/calculate', {
      honorario_id: honorarioId,
      regra_id: regraId,
    });
    return response.data;
  }

  async getExtratoDivisoes(advogadoId: string, params: any) {
    // Assuming backend endpoint /finance/fee-splits/extract/:id
    const response = await this.api.get(`/finance/fee-splits/extract/${advogadoId}`, { params });
    return response.data;
  }

  // ==================== HONORÁRIOS ====================

  async getHonorarios(filters: any) {
    const response = await this.api.get('/finance/legal-fees', { params: filters });
    return response.data;
  }

  async getHonorarioById(id: string) {
    const response = await this.api.get(`/finance/legal-fees/${id}`);
    return response.data;
  }

  async createHonorario(data: any) {
    const response = await this.api.post('/finance/legal-fees', data);
    return response.data;
  }

  async updateHonorario(id: string, data: any) {
    const response = await this.api.patch(`/finance/legal-fees/${id}`, data);
    return response.data;
  }

  async deleteHonorario(id: string) {
    const response = await this.api.delete(`/finance/legal-fees/${id}`);
    return response.data;
  }

  async getAnaliseHonorarios(params: any) {
    // Assuming endpoint /finance/legal-fees/analytics or similar, or just get with specific summary flag
    // Using /finance/legal-fees/profitability based on View names
    const response = await this.api.get('/finance/legal-fees/profitability', { params });
    return response.data;
  }

  async registrarPagamentoHonorario(id: string, data: any) {
    const response = await this.api.post(`/finance/legal-fees/${id}/payments`, data);
    return response.data;
  }

  // ==================== PAGAMENTO ====================

  async createCheckoutSession(data: any) {
    const response = await this.api.post('/finance/payment-portal/checkouts', data);
    return response.data;
  }

  async getCheckoutStatus(sessionId: string) {
    const response = await this.api.get(`/finance/payment-portal/checkouts/${sessionId}/status`);
    return response.data;
  }

  async cancelCheckout(sessionId: string) {
    const response = await this.api.post(`/finance/payment-portal/checkouts/${sessionId}/cancel`);
    return response.data;
  }

  async getConfiguracoesPortal() {
    const response = await this.api.get('/finance/payment-portal/settings');
    return response.data;
  }

  async updateConfiguracoesPortal(data: any) {
    // Previous file used PUT
    const response = await this.api.put('/finance/payment-portal/settings', data);
    return response.data;
  }
}

export const financeiroApi = new FinanceiroApiService();
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});
