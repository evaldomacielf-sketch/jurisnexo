import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    Query,
    Req,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ChatbotService } from '../services/chatbot.service';
import { ChatMessageDto, ChatResponseDto, ConversationResponseDto, MessageResponseDto } from '../dto/ai.dto';

@ApiTags('AI Chatbot')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai/chat')
export class ChatbotController {
    constructor(private readonly chatbotService: ChatbotService) { }

    @Post()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Enviar mensagem para o chatbot' })
    @ApiResponse({ status: 200, description: 'Resposta do chatbot', type: ChatResponseDto })
    async sendMessage(
        @Req() req: any,
        @Body() dto: ChatMessageDto,
    ): Promise<ChatResponseDto> {
        return this.chatbotService.chat(
            req.user.tenantId,
            req.user.id,
            dto,
        );
    }

    @Get('conversations')
    @ApiOperation({ summary: 'Listar conversas do usuário' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Lista de conversas' })
    async listConversations(
        @Req() req: any,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.chatbotService.getConversations(
            req.user.tenantId,
            req.user.id,
            page,
            limit,
        );
    }

    @Get('conversations/:id')
    @ApiOperation({ summary: 'Obter conversa com histórico de mensagens' })
    @ApiResponse({ status: 200, description: 'Conversa com mensagens' })
    async getConversation(
        @Param('id') id: string,
    ) {
        return this.chatbotService.getConversation(id);
    }

    @Delete('conversations/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Excluir uma conversa' })
    @ApiResponse({ status: 204, description: 'Conversa excluída' })
    async deleteConversation(
        @Param('id') id: string,
    ): Promise<void> {
        return this.chatbotService.deleteConversation(id);
    }
}
