import axios from '@/lib/axios';
import type { QueueStats, QueueItem, MyAssignment, AdvogadoStatus } from '@/hooks/useQueue';

const BASE_URL = '/api/whatsapp/queue';

export const queueApi = {
  // Get queue statistics
  getStats: async (): Promise<QueueStats> => {
    const { data } = await axios.get(`${BASE_URL}/stats`);
    return data;
  },

  // Get queue items
  getItems: async (take: number = 50): Promise<QueueItem[]> => {
    const { data } = await axios.get(`${BASE_URL}/items`, { params: { take } });
    return data;
  },

  // Get my active assignments
  getMyAssignments: async (): Promise<MyAssignment[]> => {
    const { data } = await axios.get(`${BASE_URL}/my-assignments`);
    return data;
  },

  // Get advogados status
  getAdvogadosStatus: async (): Promise<AdvogadoStatus[]> => {
    const { data } = await axios.get(`${BASE_URL}/advogados-status`);
    return data;
  },

  // Accept next conversation from queue
  acceptNext: async (): Promise<{ conversationId: string | null; success: boolean }> => {
    const { data } = await axios.post(`${BASE_URL}/accept-next`);
    return data;
  },

  // Set my status
  setStatus: async (status: AdvogadoStatus['status']): Promise<void> => {
    await axios.put(`${BASE_URL}/status`, { status });
  },

  // Transfer conversation
  transfer: async (conversationId: string, toAdvogadoId: string): Promise<void> => {
    await axios.post(`${BASE_URL}/transfer`, { conversationId, toAdvogadoId });
  },

  // Enqueue conversation
  enqueue: async (
    conversationId: string,
    priority: QueueItem['priority']
  ): Promise<{ position: number }> => {
    const { data } = await axios.post(`${BASE_URL}/enqueue`, { conversationId, priority });
    return data;
  },
};
