import { Injectable } from '@nestjs/common';

export enum UrgencyLevel {
    NORMAL = 'NORMAL',
    HIGH = 'HIGH',
    PLANTAO = 'PLANTAO',
}

@Injectable()
export class UrgencyService {
    private readonly KEYWORDS = {
        PLANTAO: ['socorro', 'urgente', 'polícia', 'preso', 'prisão', 'flagrante', 'delegacia', 'plantão', 'liminar', 'mandado'],
        HIGH: ['processo', 'audiência', 'prazo', 'intimado', 'citação', 'bloqueio', 'penhora'],
    };

    classify(content: string): UrgencyLevel {
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
}
