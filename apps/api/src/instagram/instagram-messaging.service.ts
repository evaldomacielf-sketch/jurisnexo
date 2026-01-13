import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class InstagramMessagingService {
    private readonly logger = new Logger(InstagramMessagingService.name);
    private readonly apiUrl = 'https://graph.facebook.com/v18.0';
    private readonly pageAccessToken: string;
    private readonly igUserId: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.pageAccessToken = this.configService.get('INSTAGRAM_PAGE_ACCESS_TOKEN');
        this.igUserId = this.configService.get('INSTAGRAM_USER_ID');
    }

    /**
     * 💬 Enviar Mensagem de Texto
     */
    async sendTextMessage(recipientId: string, text: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(
                    `${this.apiUrl}/me/messages`,
                    {
                        recipient: { id: recipientId },
                        message: { text: text },
                    },
                    {
                        params: {
                            access_token: this.pageAccessToken,
                        },
                    }
                )
            );

            this.logger.log(`Mensagem enviada para ${recipientId}`);
            return response.data;
        } catch (error) {
            this.logger.error('Erro ao enviar mensagem:', error.response?.data);
            throw error;
        }
    }

    /**
     * 🖼️ Enviar Mensagem com Imagem
     */
    async sendImageMessage(recipientId: string, imageUrl: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(
                    `${this.apiUrl}/me/messages`,
                    {
                        recipient: { id: recipientId },
                        message: {
                            attachment: {
                                type: 'image',
                                payload: { url: imageUrl },
                            },
                        },
                    },
                    {
                        params: {
                            access_token: this.pageAccessToken,
                        },
                    }
                )
            );

            return response.data;
        } catch (error) {
            this.logger.error('Erro ao enviar imagem:', error.response?.data);
            throw error;
        }
    }

    /**
     * 🔘 Enviar Mensagem com Botões de Resposta Rápida
     */
    async sendQuickReplyMessage(
        recipientId: string,
        text: string,
        quickReplies: Array<{ title: string; payload: string }>
    ) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(
                    `${this.apiUrl}/me/messages`,
                    {
                        recipient: { id: recipientId },
                        message: {
                            text: text,
                            quick_replies: quickReplies.map((qr) => ({
                                content_type: 'text',
                                title: qr.title,
                                payload: qr.payload,
                            })),
                        },
                    },
                    {
                        params: {
                            access_token: this.pageAccessToken,
                        },
                    }
                )
            );

            return response.data;
        } catch (error) {
            this.logger.error('Erro ao enviar quick reply:', error.response?.data);
            throw error;
        }
    }

    /**
     * 📖 Buscar Conversas
     */
    async getConversations() {
        try {
            const response = await firstValueFrom(
                this.httpService.get(
                    `${this.apiUrl}/${this.igUserId}/conversations`,
                    {
                        params: {
                            fields: 'id,updated_time,participants,messages{id,created_time,from,to,message}',
                            access_token: this.pageAccessToken,
                        },
                    }
                )
            );

            return response.data.data;
        } catch (error) {
            this.logger.error('Erro ao buscar conversas:', error.response?.data);
            throw error;
        }
    }

    /**
     * 📬 Buscar Mensagens de uma Conversa
     */
    async getConversationMessages(conversationId: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(
                    `${this.apiUrl}/${conversationId}`,
                    {
                        params: {
                            fields: 'messages{id,created_time,from,to,message,attachments}',
                            access_token: this.pageAccessToken,
                        },
                    }
                )
            );

            return response.data.messages.data;
        } catch (error) {
            this.logger.error('Erro ao buscar mensagens:', error.response?.data);
            throw error;
        }
    }

    /**
     * ✅ Marcar Mensagem como Lida
     */
    async markAsRead(messageId: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(
                    `${this.apiUrl}/me/messages`,
                    {
                        recipient: { id: messageId },
                        sender_action: 'mark_seen',
                    },
                    {
                        params: {
                            access_token: this.pageAccessToken,
                        },
                    }
                )
            );

            return response.data;
        } catch (error) {
            this.logger.error('Erro ao marcar como lida:', error.response?.data);
            throw error;
        }
    }
}
