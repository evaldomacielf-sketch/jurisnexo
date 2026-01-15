import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CalendarService } from './services/calendar.service';
import { GoogleCalendarService } from './services/google-calendar.service';
import { CalendarController } from './controllers/calendar.controller';
import { SupabaseModule } from '../database/supabase.module';

@Module({
    imports: [ConfigModule, SupabaseModule],
    controllers: [CalendarController],
    providers: [CalendarService, GoogleCalendarService],
    exports: [CalendarService, GoogleCalendarService],
})
export class CalendarModule { }
