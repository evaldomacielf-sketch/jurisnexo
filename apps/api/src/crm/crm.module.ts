import { Module } from '@nestjs/common';
import { CrmController } from './crm.controller';
import { CrmService } from './crm.service';
import { UrgencyService } from './urgency.service';
import { PartnersService } from './partners/partners.service';
import { PartnersController } from './partners/partners.controller';
import { CalendarService } from './calendar/calendar.service';
import { CalendarController } from './calendar/calendar.controller';
import { GamificationService } from './gamification/gamification.service';
import { GamificationController } from './gamification/gamification.controller';
import { DatabaseModule } from '../database/database.module';
import { ConversationService } from './conversations/conversation.service';

@Module({
    imports: [DatabaseModule],
    controllers: [CrmController, PartnersController, CalendarController, GamificationController],
    providers: [CrmService, UrgencyService, PartnersService, CalendarService, GamificationService, ConversationService],
    exports: [CrmService, ConversationService],
})
export class CrmModule { }
