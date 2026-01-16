'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApi, ChatResponse, Conversation, SemanticSearchParams, SearchResponse } from '@/services/api/ai.service';
import { useState, useCallback } from 'react';

// ============================================
// Chat Hooks
// ============================================

export function useConversations(page = 1, limit = 20) {
    return useQuery({
        queryKey: ['ai', 'conversations', page, limit],
        queryFn: () => aiApi.getConversations(page, limit),
    });
}

export function useConversation(id: string | undefined) {
    return useQuery({
        queryKey: ['ai', 'conversation', id],
        queryFn: () => aiApi.getConversation(id!),
        enabled: !!id,
    });
}

export function useSendMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ message, conversationId, context }: {
            message: string;
            conversationId?: string;
            context?: { caseId?: string; clientId?: string };
        }) => aiApi.sendMessage(message, conversationId, context),
        onSuccess: (data) => {
            // Invalidate conversation list
            queryClient.invalidateQueries({ queryKey: ['ai', 'conversations'] });
            // Invalidate specific conversation
            queryClient.invalidateQueries({ queryKey: ['ai', 'conversation', data.conversationId] });
        },
    });
}

export function useDeleteConversation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => aiApi.deleteConversation(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ai', 'conversations'] });
        },
    });
}

// ============================================
// Chat State Hook (for managing real-time chat)
// ============================================

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    isLoading?: boolean;
}

export function useChatState(initialConversationId?: string) {
    const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendMessage = useCallback(async (content: string, context?: { caseId?: string; clientId?: string }) => {
        // Add user message immediately
        const userMessageId = `user-${Date.now()}`;
        const userMessage: ChatMessage = {
            id: userMessageId,
            role: 'user',
            content,
        };
        setMessages(prev => [...prev, userMessage]);

        // Add loading message
        const loadingId = `loading-${Date.now()}`;
        setMessages(prev => [...prev, {
            id: loadingId,
            role: 'assistant',
            content: '',
            isLoading: true,
        }]);

        setIsLoading(true);
        setError(null);

        try {
            const response = await aiApi.sendMessage(content, conversationId, context);

            // Update conversation ID if new
            if (!conversationId && response.conversationId) {
                setConversationId(response.conversationId);
            }

            // Replace loading message with actual response
            setMessages(prev => prev.map(m =>
                m.id === loadingId
                    ? { ...response.message, isLoading: false }
                    : m
            ));

            return response;
        } catch (err: any) {
            // Remove loading message and add error
            setMessages(prev => prev.filter(m => m.id !== loadingId));
            setError(err.message || 'Erro ao enviar mensagem');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [conversationId]);

    const loadConversation = useCallback(async (id: string) => {
        try {
            const conversation = await aiApi.getConversation(id);
            setConversationId(id);
            setMessages(conversation.messages || []);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar conversa');
        }
    }, []);

    const startNewConversation = useCallback(() => {
        setConversationId(undefined);
        setMessages([]);
        setError(null);
    }, []);

    return {
        conversationId,
        messages,
        isLoading,
        error,
        sendMessage,
        loadConversation,
        startNewConversation,
    };
}

// ============================================
// Search Hooks
// ============================================

export function useSemanticSearch() {
    const [results, setResults] = useState<SearchResponse | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const search = useCallback(async (params: SemanticSearchParams) => {
        setIsSearching(true);
        setError(null);

        try {
            const response = await aiApi.semanticSearch(params);
            setResults(response);
            return response;
        } catch (err: any) {
            setError(err.message || 'Erro na busca');
            throw err;
        } finally {
            setIsSearching(false);
        }
    }, []);

    const searchJurisprudence = useCallback(async (query: string, tribunals?: string[]) => {
        setIsSearching(true);
        setError(null);

        try {
            const response = await aiApi.searchJurisprudence(query, tribunals);
            setResults(response);
            return response;
        } catch (err: any) {
            setError(err.message || 'Erro na busca de jurisprudência');
            throw err;
        } finally {
            setIsSearching(false);
        }
    }, []);

    const clearResults = useCallback(() => {
        setResults(null);
        setError(null);
    }, []);

    return {
        results,
        isSearching,
        error,
        search,
        searchJurisprudence,
        clearResults,
    };
}
