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
    Res,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CalendarService } from '../services/calendar.service';
import { GoogleCalendarService } from '../services/google-calendar.service';
import {
    CreateEventDto,
    UpdateEventDto,
    EventResponseDto,
    EventType,
    GoogleCalendarAuthDto,
    GoogleCalendarSyncDto,
} from '../dto/calendar.dto';

@ApiTags('Calendar')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('calendar')
export class CalendarController {
    constructor(
        private readonly calendarService: CalendarService,
        private readonly googleCalendarService: GoogleCalendarService,
    ) { }

    // ============================================
    // Event CRUD
    // ============================================

    @Post('events')
    @ApiOperation({ summary: 'Criar evento no calendário' })
    @ApiResponse({ status: 201, type: EventResponseDto })
    async createEvent(
        @Req() req: any,
        @Body() dto: CreateEventDto,
    ): Promise<EventResponseDto> {
        return this.calendarService.create(req.user.tenantId, req.user.id, dto);
    }

    @Get('events')
    @ApiOperation({ summary: 'Listar eventos do calendário' })
    @ApiQuery({ name: 'startDate', required: true })
    @ApiQuery({ name: 'endDate', required: true })
    @ApiQuery({ name: 'type', required: false, enum: EventType })
    @ApiQuery({ name: 'caseId', required: false })
    @ApiQuery({ name: 'clientId', required: false })
    async getEvents(
        @Req() req: any,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Query('type') type?: EventType,
        @Query('caseId') caseId?: string,
        @Query('clientId') clientId?: string,
    ): Promise<EventResponseDto[]> {
        return this.calendarService.getEvents(req.user.tenantId, req.user.id, startDate, endDate, {
            type,
            caseId,
            clientId,
        });
    }

    @Get('events/upcoming')
    @ApiOperation({ summary: 'Listar próximos eventos' })
    @ApiQuery({ name: 'limit', required: false })
    async getUpcoming(
        @Req() req: any,
        @Query('limit') limit?: number,
    ): Promise<EventResponseDto[]> {
        return this.calendarService.getUpcoming(req.user.tenantId, req.user.id, limit);
    }

    @Get('events/stats')
    @ApiOperation({ summary: 'Estatísticas de eventos por tipo' })
    @ApiQuery({ name: 'startDate', required: true })
    @ApiQuery({ name: 'endDate', required: true })
    async getStats(
        @Req() req: any,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ) {
        return this.calendarService.getEventsByType(req.user.tenantId, startDate, endDate);
    }

    @Get('events/:id')
    @ApiOperation({ summary: 'Obter evento por ID' })
    @ApiResponse({ status: 200, type: EventResponseDto })
    async getEvent(@Param('id') id: string): Promise<EventResponseDto> {
        return this.calendarService.getById(id);
    }

    @Put('events/:id')
    @ApiOperation({ summary: 'Atualizar evento' })
    @ApiResponse({ status: 200, type: EventResponseDto })
    async updateEvent(
        @Param('id') id: string,
        @Body() dto: UpdateEventDto,
        @Query('syncGoogle') syncGoogle?: boolean,
    ): Promise<EventResponseDto> {
        return this.calendarService.update(id, dto, syncGoogle);
    }

    @Delete('events/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Excluir evento' })
    async deleteEvent(@Param('id') id: string): Promise<void> {
        return this.calendarService.delete(id);
    }

    // ============================================
    // Google Calendar Integration
    // ============================================

    @Get('google/auth')
    @ApiOperation({ summary: 'Obter URL de autorização do Google Calendar' })
    async getGoogleAuthUrl(@Req() req: any) {
        const authUrl = this.googleCalendarService.getAuthUrl(req.user.id);
        return { authUrl };
    }

    @Get('google/callback')
    @ApiOperation({ summary: 'Callback de autorização do Google' })
    async googleCallback(
        @Query('code') code: string,
        @Query('state') state: string,
        @Res() res: Response,
    ) {
        await this.googleCalendarService.handleCallback(code, state);
        // Redirect to frontend with success
        res.redirect('/dashboard/calendario?connected=true');
    }

    @Get('google/status')
    @ApiOperation({ summary: 'Verificar status de conexão com Google Calendar' })
    async getGoogleStatus(@Req() req: any) {
        const connected = await this.googleCalendarService.isConnected(req.user.id);
        return { connected };
    }

    @Delete('google/disconnect')
    @ApiOperation({ summary: 'Desconectar do Google Calendar' })
    async disconnectGoogle(@Req() req: any) {
        await this.googleCalendarService.disconnect(req.user.id);
        return { success: true };
    }

    @Post('google/sync')
    @ApiOperation({ summary: 'Sincronizar eventos do Google Calendar' })
    async syncGoogleEvents(
        @Req() req: any,
        @Body() dto: GoogleCalendarSyncDto,
    ) {
        const events = await this.googleCalendarService.syncEvents(
            req.user.id,
            dto.startDate,
            dto.endDate,
        );
        return { imported: events.length, events };
    }
}
