import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { SupabaseService } from '../../database/supabase.service';
import { ChatMessageDto, ChatResponseDto, MessageResponseDto } from '../dto/ai.dto';
import { legalFunctions, executeLegalFunction } from '../functions/legal-functions';

interface ConversationMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

@Injectable()
export class ChatbotService {
    private readonly logger = new Logger(ChatbotService.name);
    private readonly openai: OpenAI;
    private readonly model = 'gpt-4-turbo-preview';
    private readonly maxTokens = 4096;

    // System prompt for legal assistant
    private readonly systemPrompt = `Você é **JurisNexo AI**, um assistente jurídico inteligente para advogados brasileiros.

## Suas Capacidades:
- Responder consultas jurídicas com base no direito brasileiro
- Analisar documentos (petições, contratos, recursos)
- Calcular prazos processuais
- Buscar jurisprudência relevante
- Auxiliar na redação de minutas
- Consultar processos do cliente

## Diretrizes:
1. Sempre cite a fonte legal quando aplicável (artigo, lei, súmula)
2. Use linguagem técnica-jurídica quando apropriado, mas seja claro
3. Quando incerto, indique que recomenda consulta especializada
4. Formate respostas em Markdown para melhor leitura
5. Para cálculos de prazo, use dias úteis (exceto feriados forenses)
6. Mantenha confidencialidade - nunca mencione dados de outros clientes

## Contexto Atual:
- Sistema: JurisNexo CRM Jurídico
- Jurisdição: Brasil
- Data atual: ${new Date().toLocaleDateString('pt-BR')}`;

    constructor(
        private readonly configService: ConfigService,
        private readonly supabase: SupabaseService,
    ) {
        this.openai = new OpenAI({
            apiKey: this.configService.get<string>('OPENAI_API_KEY'),
        });
    }

    /**
     * Process a chat message and return AI response
     */
    async chat(tenantId: string, userId: string, dto: ChatMessageDto): Promise<ChatResponseDto> {
        const startTime = Date.now();

        // Get or create conversation
        let conversationId = dto.conversationId;
        if (!conversationId) {
            conversationId = await this.createConversation(tenantId, userId, dto.message);
        }

        // Get conversation history
        const history = await this.getConversationHistory(conversationId);

        // Build messages array
        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
            { role: 'system', content: this.buildSystemPrompt(dto.context) },
            ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
            { role: 'user', content: dto.message },
        ];

        // Save user message
        await this.saveMessage(conversationId, 'user', dto.message);

        try {
            // Call OpenAI with function calling
            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages,
                max_tokens: this.maxTokens,
                temperature: 0.7,
                tools: legalFunctions,
                tool_choice: 'auto',
            });

            let assistantMessage = response.choices[0].message;
            let finalContent = assistantMessage.content || '';

            // Handle function calls
            if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
                const functionResults = await this.handleFunctionCalls(
                    tenantId,
                    assistantMessage.tool_calls,
                );

                // Call again with function results
                messages.push(assistantMessage);
                functionResults.forEach(result => {
                    messages.push({
                        role: 'tool',
                        tool_call_id: result.toolCallId,
                        content: JSON.stringify(result.result),
                    });
                });

                const followUpResponse = await this.openai.chat.completions.create({
                    model: this.model,
                    messages,
                    max_tokens: this.maxTokens,
                    temperature: 0.7,
                });

                finalContent = followUpResponse.choices[0].message.content || '';
            }

            // Save assistant message
            const savedMessage = await this.saveMessage(
                conversationId,
                'assistant',
                finalContent,
                response.usage?.total_tokens,
            );

            // Calculate cost (GPT-4 Turbo pricing: $10/1M input, $30/1M output)
            const inputTokens = response.usage?.prompt_tokens || 0;
            const outputTokens = response.usage?.completion_tokens || 0;
            const cost = (inputTokens * 0.00001) + (outputTokens * 0.00003);

            // Update usage tracking
            await this.trackUsage(tenantId, userId, inputTokens, outputTokens, cost);

            this.logger.log(`Chat completed in ${Date.now() - startTime}ms, tokens: ${inputTokens + outputTokens}`);

            return {
                conversationId,
                message: {
                    id: savedMessage.id,
                    role: 'assistant',
                    content: finalContent,
                    tokensUsed: inputTokens + outputTokens,
                    createdAt: savedMessage.created_at,
                },
                suggestedActions: this.extractSuggestedActions(finalContent),
                cost: {
                    inputTokens,
                    outputTokens,
                    totalCost: cost,
                },
            };
        } catch (error) {
            this.logger.error(`Chat error: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Create a new conversation
     */
    private async createConversation(tenantId: string, userId: string, firstMessage: string): Promise<string> {
        // Generate title from first message
        const title = firstMessage.length > 50
            ? firstMessage.substring(0, 50) + '...'
            : firstMessage;

        const { data, error } = await this.supabase.client
            .from('ai_conversations')
            .insert({
                tenant_id: tenantId,
                user_id: userId,
                title,
            })
            .select('id')
            .single();

        if (error) throw error;
        return data.id;
    }

    /**
     * Get conversation history
     */
    private async getConversationHistory(conversationId: string): Promise<ConversationMessage[]> {
        const { data, error } = await this.supabase.client
            .from('ai_messages')
            .select('role, content')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true })
            .limit(20); // Keep last 20 messages for context

        if (error) throw error;
        return data || [];
    }

    /**
     * Save a message to the database
     */
    private async saveMessage(
        conversationId: string,
        role: 'user' | 'assistant' | 'system',
        content: string,
        tokensUsed?: number,
    ): Promise<any> {
        const { data, error } = await this.supabase.client
            .from('ai_messages')
            .insert({
                conversation_id: conversationId,
                role,
                content,
                tokens_used: tokensUsed,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Handle OpenAI function calls
     */
    private async handleFunctionCalls(
        tenantId: string,
        toolCalls: OpenAI.Chat.ChatCompletionMessageToolCall[],
    ): Promise<{ toolCallId: string; result: any }[]> {
        const results = [];

        for (const toolCall of toolCalls) {
            const functionName = toolCall.function.name;
            const args = JSON.parse(toolCall.function.arguments);

            this.logger.log(`Executing function: ${functionName} with args: ${JSON.stringify(args)}`);

            const result = await executeLegalFunction(
                functionName,
                args,
                tenantId,
                this.supabase,
            );

            results.push({
                toolCallId: toolCall.id,
                result,
            });
        }

        return results;
    }

    /**
     * Build system prompt with context
     */
    private buildSystemPrompt(context?: { caseId?: string; clientId?: string; documentId?: string }): string {
        let prompt = this.systemPrompt;

        if (context) {
            prompt += '\n\n## Contexto da Conversa:';
            if (context.caseId) prompt += `\n- Processo em foco: ${context.caseId}`;
            if (context.clientId) prompt += `\n- Cliente em foco: ${context.clientId}`;
            if (context.documentId) prompt += `\n- Documento em análise: ${context.documentId}`;
        }

        return prompt;
    }

    /**
     * Extract suggested actions from response
     */
    private extractSuggestedActions(content: string): { type: string; label: string; payload: any }[] {
        const actions = [];

        // Detect prazo mentions
        if (content.includes('prazo') || content.includes('vencimento')) {
            actions.push({
                type: 'create_reminder',
                label: 'Criar Lembrete',
                payload: { content: 'Lembrete de prazo processual' },
            });
        }

        // Detect document mentions
        if (content.includes('petição') || content.includes('minuta') || content.includes('recurso')) {
            actions.push({
                type: 'create_document',
                label: 'Gerar Documento',
                payload: { type: 'draft' },
            });
        }

        // Detect jurisprudence mentions
        if (content.includes('jurisprudência') || content.includes('precedente')) {
            actions.push({
                type: 'search_jurisprudence',
                label: 'Buscar Jurisprudência',
                payload: {},
            });
        }

        return actions;
    }

    /**
     * Track usage for billing
     */
    private async trackUsage(
        tenantId: string,
        userId: string,
        inputTokens: number,
        outputTokens: number,
        cost: number,
    ): Promise<void> {
        await this.supabase.client
            .from('ai_usage')
            .insert({
                tenant_id: tenantId,
                user_id: userId,
                input_tokens: inputTokens,
                output_tokens: outputTokens,
                cost,
            });
    }

    /**
     * Get user's conversations
     */
    async getConversations(tenantId: string, userId: string, page = 1, limit = 20) {
        const offset = (page - 1) * limit;

        const { data, error, count } = await this.supabase.client
            .from('ai_conversations')
            .select('*, ai_messages(count)', { count: 'exact' })
            .eq('tenant_id', tenantId)
            .eq('user_id', userId)
            .order('updated_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        return {
            items: data,
            total: count,
            page,
            limit,
        };
    }

    /**
     * Get conversation with messages
     */
    async getConversation(conversationId: string) {
        const { data: conversation, error: convError } = await this.supabase.client
            .from('ai_conversations')
            .select('*')
            .eq('id', conversationId)
            .single();

        if (convError) throw convError;

        const { data: messages, error: msgError } = await this.supabase.client
            .from('ai_messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (msgError) throw msgError;

        return {
            ...conversation,
            messages,
        };
    }

    /**
     * Delete a conversation
     */
    async deleteConversation(conversationId: string): Promise<void> {
        // Delete messages first
        await this.supabase.client
            .from('ai_messages')
            .delete()
            .eq('conversation_id', conversationId);

        // Delete conversation
        await this.supabase.client
            .from('ai_conversations')
            .delete()
            .eq('id', conversationId);
    }
}
