"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrmModule = void 0;
const common_1 = require("@nestjs/common");
const crm_controller_1 = require("./crm.controller");
const crm_service_1 = require("./crm.service");
const urgency_service_1 = require("./urgency.service");
const partners_service_1 = require("./partners/partners.service");
const partners_controller_1 = require("./partners/partners.controller");
const calendar_service_1 = require("./calendar/calendar.service");
const calendar_controller_1 = require("./calendar/calendar.controller");
const gamification_service_1 = require("./gamification/gamification.service");
const gamification_controller_1 = require("./gamification/gamification.controller");
const database_module_1 = require("../database/database.module");
let CrmModule = class CrmModule {
};
exports.CrmModule = CrmModule;
exports.CrmModule = CrmModule = __decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule],
        controllers: [crm_controller_1.CrmController, partners_controller_1.PartnersController, calendar_controller_1.CalendarController, gamification_controller_1.GamificationController],
        providers: [crm_service_1.CrmService, urgency_service_1.UrgencyService, partners_service_1.PartnersService, calendar_service_1.CalendarService, gamification_service_1.GamificationService],
        exports: [crm_service_1.CrmService],
    })
], CrmModule);
//# sourceMappingURL=crm.module.js.map