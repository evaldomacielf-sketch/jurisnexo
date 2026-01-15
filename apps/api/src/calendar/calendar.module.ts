import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CalendarService } from './services/calendar.service';
import { GoogleCalendarService } from './services/google-calendar.service';
import { CalendarController } from './controllers/calendar.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [ConfigModule, DatabaseModule],
    controllers: [CalendarController],
    providers: [CalendarService, GoogleCalendarService],
    exports: [CalendarService, GoogleCalendarService],
})
export class CalendarModule { }
