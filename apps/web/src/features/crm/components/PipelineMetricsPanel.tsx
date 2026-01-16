import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Target, Clock, Percent } from 'lucide-react';
import { leadsApi } from '@/services/api/leads';
import { formatCurrency } from '@/lib/utils';

interface PipelineMetricsPanelProps {
  pipelineId: string;
}

export function PipelineMetricsPanel({ pipelineId }: PipelineMetricsPanelProps) {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['pipeline-metrics', pipelineId],
    queryFn: () => leadsApi.getPipelineMetrics(pipelineId),
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) return null;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
      {/* Total Leads */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total de Leads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{metrics.total_leads}</span>
            <Target className="h-8 w-8 text-muted-foreground opacity-20" />
          </div>
        </CardContent>
      </Card>

      {/* Total Value */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Valor Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{formatCurrency(metrics.total_value)}</span>
            <DollarSign className="h-8 w-8 text-muted-foreground opacity-20" />
          </div>
        </CardContent>
      </Card>

      {/* Won Leads */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-green-700">Leads Ganhos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-700">{metrics.won_leads}</div>
              <div className="text-sm text-green-600">{formatCurrency(metrics.won_value)}</div>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500 opacity-50" />
          </div>
        </CardContent>
      </Card>

      {/* Lost Leads */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-red-700">Leads Perdidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-700">{metrics.lost_leads}</div>
              <div className="text-sm text-red-600">{formatCurrency(metrics.lost_value)}</div>
            </div>
            <TrendingDown className="h-8 w-8 text-red-500 opacity-50" />
          </div>
        </CardContent>
      </Card>

      {/* Conversion Rate */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Taxa de Conversão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{metrics.conversion_rate.toFixed(1)}%</span>
            <Percent className="h-8 w-8 text-muted-foreground opacity-20" />
          </div>
        </CardContent>
      </Card>

      {/* Average Days to Close */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Tempo Médio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{metrics.average_days_to_close}</div>
              <div className="text-sm text-muted-foreground">dias</div>
            </div>
            <Clock className="h-8 w-8 text-muted-foreground opacity-20" />
          </div>
        </CardContent>
      </Card>

      {/* Stage Conversion Funnel */}
      <Card className="md:col-span-2 lg:col-span-6">
        <CardHeader>
          <CardTitle>Funil de Conversão por Estágio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.stage_metrics.map((stage, index) => {
              const isLast = index === metrics.stage_metrics.length - 1;
              const conversionRate = stage.conversion_to_next_stage;

              return (
                <div key={stage.stage_id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{stage.stage_name}</span>
                      <Badge variant="secondary">{stage.lead_count} leads</Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(stage.total_value)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="relative h-8 overflow-hidden rounded-md bg-gray-100">
                    <div className="stage-progress absolute h-full bg-primary transition-all" />
                    <style jsx>{`
                      .stage-progress {
                        width: ${metrics.total_leads > 0
                          ? (stage.lead_count / metrics.total_leads) * 100
                          : 0}%;
                      }
                    `}</style>
                    <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-medium">
                      <span>
                        {metrics.total_leads > 0
                          ? ((stage.lead_count / metrics.total_leads) * 100).toFixed(1)
                          : 0}
                        % do total
                      </span>
                      {!isLast && (
                        <span className="text-green-700">
                          {conversionRate.toFixed(1)}% conversão →
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
