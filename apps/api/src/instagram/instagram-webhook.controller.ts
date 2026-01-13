import { Controller, Post, Get, Body, Query, Logger, HttpCode } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';

@Controller('webhooks/instagram')
export class InstagramWebhookController {
    private readonly logger = new Logger(InstagramWebhookController.name);
    private readonly verifyToken = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN;

    /**
     * 🔐 Verificação de Webhook (Meta exige isso)
     */
    @Public()
    @Get()
    verifyWebhook(
        @Query('hub.mode') mode: string,
        @Query('hub.verify_token') token: string,
        @Query('hub.challenge') challenge: string,
    ) {
        if (mode === 'subscribe' && token === this.verifyToken) {
            this.logger.log('✅ Webhook verificado com sucesso');
            return challenge;
        }

        this.logger.error('❌ Falha na verificação do webhook');
        return 'Verification failed';
    }

    /**
     * 📨 Receber Eventos do Instagram
     */
    @Public()
    @Post()
    @HttpCode(200)
    async handleWebhook(@Body() body: any) {
        this.logger.log('📨 Webhook recebido:', JSON.stringify(body));

        if (body.object === 'instagram') {
            for (const entry of body.entry) {
                // Mensagens recebidas
                if (entry.messaging) {
                    for (const messagingEvent of entry.messaging) {
                        await this.handleMessage(messagingEvent);
                    }
                }

                // Comentários
                if (entry.changes) {
                    for (const change of entry.changes) {
                        if (change.field === 'comments') {
                            await this.handleComment(change.value);
                        }
                        if (change.field === 'mentions') {
                            await this.handleMention(change.value);
                        }
                    }
                }
            }
        }

        return 'EVENT_RECEIVED';
    }

    /**
     * 💬 Processar Mensagem Recebida
     */
    private async handleMessage(event: any) {
        const senderId = event.sender.id;
        const recipientId = event.recipient.id;
        const message = event.message;

        this.logger.log(`📩 Nova mensagem de ${senderId}:`, message);

        // TODO: Salvar mensagem no banco
        // TODO: Criar lead se não existir
        // TODO: Notificar frontend via WebSocket
        // TODO: Resposta automática (se configurado)

        if (message.text) {
            this.logger.log(`Texto: ${message.text}`);

            // Exemplo de resposta automática
            // await this.messagingService.sendTextMessage(
            //   senderId,
            //   'Obrigado pela mensagem! Em breve entraremos em contato.'
            // );
        }

        if (message.attachments) {
            this.logger.log('📎 Anexos recebidos:', message.attachments);
        }
    }

    /**
     * 💭 Processar Comentário
     */
    private async handleComment(comment: any) {
        this.logger.log(`💬 Novo comentário:`, comment);

        // TODO: Salvar comentário
        // TODO: Notificar moderadores
        // TODO: Resposta automática (se configurado)
    }

    /**
     * 🏷️ Processar Menção
     */
    private async handleMention(mention: any) {
        this.logger.log(`🏷️ Nova menção:`, mention);

        // TODO: Salvar menção
        // TODO: Notificar equipe
    }
}
