import {
    Controller,
    Get,
    Post,
    Put,
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
import { ChatService } from '../services/chat.service';
import {
    CreateChatDto,
    UpdateChatDto,
    SendMessageDto,
    ChatResponseDto,
    MessageResponseDto,
} from '../dto/chat.dto';

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    // ============================================
    // Chat CRUD
    // ============================================

    @Post()
    @ApiOperation({ summary: 'Criar novo chat' })
    @ApiResponse({ status: 201, type: ChatResponseDto })
    async createChat(
        @Req() req: any,
        @Body() dto: CreateChatDto,
    ): Promise<ChatResponseDto> {
        return this.chatService.createChat(req.user.tenantId, req.user.id, dto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar chats do usuário' })
    @ApiResponse({ status: 200, type: [ChatResponseDto] })
    async getUserChats(@Req() req: any): Promise<ChatResponseDto[]> {
        return this.chatService.getUserChats(req.user.tenantId, req.user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obter chat por ID' })
    @ApiResponse({ status: 200, type: ChatResponseDto })
    async getChat(
        @Param('id') id: string,
        @Req() req: any,
    ): Promise<ChatResponseDto> {
        return this.chatService.getChatById(id, req.user.id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar chat' })
    @ApiResponse({ status: 200, type: ChatResponseDto })
    async updateChat(
        @Param('id') id: string,
        @Body() dto: UpdateChatDto,
    ): Promise<ChatResponseDto> {
        return this.chatService.updateChat(id, dto);
    }

    // ============================================
    // Messages
    // ============================================

    @Post('messages')
    @ApiOperation({ summary: 'Enviar mensagem (via REST - prefer WebSocket)' })
    @ApiResponse({ status: 201, type: MessageResponseDto })
    async sendMessage(
        @Req() req: any,
        @Body() dto: SendMessageDto,
    ): Promise<MessageResponseDto> {
        return this.chatService.sendMessage(req.user.id, dto);
    }

    @Get(':id/messages')
    @ApiOperation({ summary: 'Obter mensagens do chat' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    async getMessages(
        @Param('id') id: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.chatService.getMessages(id, page, limit);
    }

    @Post(':id/messages/read')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Marcar mensagens como lidas' })
    async markAsRead(
        @Param('id') chatId: string,
        @Req() req: any,
        @Body() body: { messageIds: string[] },
    ) {
        await this.chatService.markAsRead(chatId, req.user.id, body.messageIds);
        return { success: true };
    }

    @Delete('messages/:messageId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Excluir mensagem' })
    async deleteMessage(
        @Param('messageId') messageId: string,
        @Req() req: any,
    ): Promise<void> {
        await this.chatService.deleteMessage(messageId, req.user.id);
    }

    // ============================================
    // Participants
    // ============================================

    @Get(':id/participants')
    @ApiOperation({ summary: 'Obter participantes do chat' })
    async getParticipants(@Param('id') chatId: string) {
        return this.chatService.getParticipants(chatId);
    }
}
