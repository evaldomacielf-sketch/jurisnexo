import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InstagramService } from './instagram.service';
import { InstagramMessagingService } from './instagram-messaging.service';

@Controller('instagram')
@UseGuards(JwtAuthGuard)
export class InstagramController {
    constructor(
        private readonly instagramService: InstagramService,
        private readonly messagingService: InstagramMessagingService,
    ) { }

    /**
     * 📊 Buscar Perfil
     */
    @Get('profile')
    async getProfile() {
        return this.instagramService.getProfile();
    }

    /**
     * 📈 Buscar Insights
     */
    @Get('insights')
    async getInsights() {
        return this.instagramService.getAccountInsights();
    }

    /**
     * 📸 Publicar Imagem
     */
    @Post('publish/image')
    async publishImage(@Body() data: { imageUrl: string; caption: string }) {
        return this.instagramService.publishImage(data.imageUrl, data.caption);
    }

    /**
     * 📹 Publicar Carrossel
     */
    @Post('publish/carousel')
    async publishCarousel(
        @Body() data: { items: Array<{ imageUrl: string }>; caption: string }
    ) {
        return this.instagramService.publishCarousel(data.items, data.caption);
    }

    /**
     * 💬 Buscar Conversas
     */
    @Get('conversations')
    async getConversations() {
        return this.messagingService.getConversations();
    }

    /**
     * 📬 Buscar Mensagens de Conversa
     */
    @Get('conversations/:id/messages')
    async getMessages(@Param('id') conversationId: string) {
        return this.messagingService.getConversationMessages(conversationId);
    }

    /**
     * 📨 Enviar Mensagem
     */
    @Post('send-message')
    async sendMessage(@Body() data: { recipientId: string; text: string }) {
        return this.messagingService.sendTextMessage(data.recipientId, data.text);
    }

    /**
     * 💭 Buscar Comentários
     */
    @Get('posts/:id/comments')
    async getComments(@Param('id') mediaId: string) {
        return this.instagramService.getPostComments(mediaId);
    }

    /**
     * ✍️ Responder Comentário
     */
    @Post('comments/:id/reply')
    async replyComment(@Param('id') commentId: string, @Body() data: { message: string }) {
        return this.instagramService.replyToComment(commentId, data.message);
    }
}
