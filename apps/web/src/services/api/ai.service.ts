import api from '@/lib/api';

// Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokensUsed?: number;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  messages?: ChatMessage[];
}

export interface ChatResponse {
  conversationId: string;
  message: ChatMessage;
  suggestedActions?: {
    type: string;
    label: string;
    payload: any;
  }[];
  cost?: {
    inputTokens: number;
    outputTokens: number;
    totalCost: number;
  };
}

export interface SemanticSearchParams {
  query: string;
  documentTypes?: ('jurisprudence' | 'legislation' | 'case' | 'contract')[];
  tribunals?: string[];
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

export interface SearchResult {
  id: string;
  documentType: string;
  title: string;
  content: string;
  similarity: number;
  metadata?: {
    tribunal?: string;
    date?: string;
    numero?: string;
    relator?: string;
    ementa?: string;
  };
  citation?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  totalResults: number;
  queryEmbeddingTime: number;
  searchTime: number;
}

// API Functions
export const aiApi = {
  // Chat
  sendMessage: async (
    message: string,
    conversationId?: string,
    context?: { caseId?: string; clientId?: string }
  ): Promise<ChatResponse> => {
    const response = await api.post('/ai/chat', {
      message,
      conversationId,
      context,
    });
    return response.data;
  },

  getConversations: async (
    page = 1,
    limit = 20
  ): Promise<{ items: Conversation[]; total: number }> => {
    const response = await api.get('/ai/chat/conversations', {
      params: { page, limit },
    });
    return response.data;
  },

  getConversation: async (id: string): Promise<Conversation> => {
    const response = await api.get(`/ai/chat/conversations/${id}`);
    return response.data;
  },

  deleteConversation: async (id: string): Promise<void> => {
    await api.delete(`/ai/chat/conversations/${id}`);
  },

  // Search
  semanticSearch: async (params: SemanticSearchParams): Promise<SearchResponse> => {
    const response = await api.post('/ai/search', params);
    return response.data;
  },

  searchJurisprudence: async (
    query: string,
    tribunals?: string[],
    limit = 10
  ): Promise<SearchResponse> => {
    const response = await api.post('/ai/search/jurisprudencia', {
      query,
      tribunals,
      limit,
    });
    return response.data;
  },

  searchLegislation: async (query: string, limit = 10): Promise<SearchResponse> => {
    const response = await api.post('/ai/search/legislacao', {
      query,
      limit,
    });
    return response.data;
  },

  indexDocument: async (
    content: string,
    documentType: string,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; chunksCreated: number }> => {
    const response = await api.post('/ai/search/documents/index', {
      content,
      documentType,
      metadata,
    });
    return response.data;
  },
};

export default aiApi;
