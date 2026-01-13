"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrgencyService = exports.UrgencyLevel = void 0;
const common_1 = require("@nestjs/common");
var UrgencyLevel;
(function (UrgencyLevel) {
    UrgencyLevel["NORMAL"] = "NORMAL";
    UrgencyLevel["HIGH"] = "HIGH";
    UrgencyLevel["PLANTAO"] = "PLANTAO";
})(UrgencyLevel || (exports.UrgencyLevel = UrgencyLevel = {}));
let UrgencyService = class UrgencyService {
    constructor() {
        this.KEYWORDS = {
            PLANTAO: ['socorro', 'urgente', 'polícia', 'preso', 'prisão', 'flagrante', 'delegacia', 'plantão', 'liminar', 'mandado'],
            HIGH: ['processo', 'audiência', 'prazo', 'intimado', 'citação', 'bloqueio', 'penhora'],
        };
    }
    classify(content) {
        const lowerContent = content.toLowerCase();
        // Check for PLANTAO keywords
        if (this.KEYWORDS.PLANTAO.some(keyword => lowerContent.includes(keyword))) {
            return UrgencyLevel.PLANTAO;
        }
        // Check for HIGH keywords
        if (this.KEYWORDS.HIGH.some(keyword => lowerContent.includes(keyword))) {
            return UrgencyLevel.HIGH;
        }
        // Default to NORMAL
        return UrgencyLevel.NORMAL;
    }
};
exports.UrgencyService = UrgencyService;
exports.UrgencyService = UrgencyService = __decorate([
    (0, common_1.Injectable)()
], UrgencyService);
//# sourceMappingURL=urgency.service.js.map