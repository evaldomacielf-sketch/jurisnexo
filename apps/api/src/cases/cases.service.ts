import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class CasesService {
    constructor(private readonly db: DatabaseService) { }

    async getKanbanData() {
        // Moved from CrmService - currently Mock Data
        return {
            columns: [
                {
                    id: 'col-1',
                    title: 'Novos Leads',
                    cards: [
                        {
                            id: 'card-1',
                            title: 'Contato Inicial - Maria Silva',
                            description: 'Interessada em divórcio consensual',
                            tag: 'Família',
                            tagColor: 'purple',
                            avatar: 'MS',
                            priority: 'urgent',
                            time: '2h atrás'
                        },
                        {
                            id: 'card-2',
                            title: 'Dúvida Trabalhista - João',
                            description: 'Questão sobre horas extras',
                            tag: 'Trabalhista',
                            tagColor: 'orange',
                            avatar: 'JD',
                            priority: 'normal',
                            time: '5h atrás'
                        }
                    ]
                },
                {
                    id: 'col-2',
                    title: 'Em Qualificação',
                    cards: []
                },
                {
                    id: 'col-3',
                    title: 'Proposta Enviada',
                    cards: [
                        {
                            id: 'card-3',
                            title: 'Contrato Social - Tech Ltda',
                            description: 'Aguardando assinatura dos sócios',
                            tag: 'Empresarial',
                            tagColor: 'blue',
                            avatar: 'TL',
                            priority: 'updated',
                            time: '1d atrás'
                        }
                    ]
                },
                {
                    id: 'col-4',
                    title: 'Fechado',
                    cards: []
                }
            ]
        };
    }

    // Future: Implement Real DB fetch
    // async findAll(tenantId: string) { ... }
}
