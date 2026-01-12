import { Controller, Post, Get, Body, Query, UseGuards, Request } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { AuthGuard } from '../../auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Calendar')
@Controller('crm/calendar')
export class CalendarController {
    constructor(private readonly calendarService: CalendarService) { }

    @UseGuards(AuthGuard)
    @Get('connect')
    @ApiOperation({ summary: 'Get Google OAuth URL' })
    async connect(@Request() req) {
        return this.calendarService.generateAuthUrl(req.user.id);
    }

    @UseGuards(AuthGuard)
    @Post('callback')
    @ApiOperation({ summary: 'Exchange OAuth Code' })
    async callback(@Request() req, @Body('code') code: string) {
        return this.calendarService.connect(req.user.id, code);
    }

    @UseGuards(AuthGuard)
    @Post('schedule')
    @ApiOperation({ summary: 'Schedule a meeting' })
    async schedule(@Request() req, @Body() body: { conversationId: string; title: string; startTime: string; endTime: string; mode: 'REMOTE' | 'PRESENCIAL' }) {
        return this.calendarService.scheduleMeeting(req.user.tenantId, req.user.id, body);
    }
}
