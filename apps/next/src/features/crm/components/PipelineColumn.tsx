import { useDroppable } from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LeadCard } from './LeadCard';
import { formatCurrency } from '@/lib/utils';
import type { Stage, Lead } from '@/types/leads';

interface PipelineColumnProps {
    stage: Stage;
    leads: Lead[];
    isLoading?: boolean;
}

export function PipelineColumn({ stage, leads, isLoading }: PipelineColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: `stage-${stage.id}`,
    });

    const totalValue = leads.reduce((sum, lead) => sum + lead.estimated_value, 0);

    return (
        <Card
            ref={setNodeRef}
            className={`flex-shrink-0 w-80 transition-colors ${isOver ? 'ring-2 ring-primary' : ''
                }`}
        >
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: stage.color }}
                        />
                        <CardTitle className="text-base font-semibold">
                            {stage.name}
                        </CardTitle>
                    </div>
                    <Badge variant="secondary">{leads.length}</Badge>
                </div>

                {/* Stage metrics */}
                <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                    <span>{formatCurrency(totalValue)}</span>
                    <span>{stage.default_probability}%</span>
                </div>
            </CardHeader>

            <CardContent className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                    </div>
                ) : (
                    <SortableContext
                        items={leads.map((l) => l.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {leads.length > 0 ? (
                            leads.map((lead) => <LeadCard key={lead.id} lead={lead} />)
                        ) : (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                Nenhum lead neste estágio
                            </div>
                        )}
                    </SortableContext>
                )}
            </CardContent>
        </Card>
    );
}
