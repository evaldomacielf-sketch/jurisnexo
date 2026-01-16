import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, Mail, Calendar, MessageSquare, CheckSquare, Plus, User } from 'lucide-react';
import { leadsApi } from '@/services/api/leads';
import { formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';
import type { LeadActivity, ActivityType } from '@/types/leads';

interface LeadActivitiesTimelineProps {
  leadId: string;
  activities: LeadActivity[];
}

const ACTIVITY_ICONS: Record<ActivityType, typeof Phone> = {
  Call: Phone,
  Email: Mail,
  Meeting: Calendar,
  Task: CheckSquare,
  Note: MessageSquare,
  StatusChange: MessageSquare,
  StageChange: MessageSquare,
  ValueChange: MessageSquare,
  AssignmentChange: User,
};

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  Call: 'Ligação',
  Email: 'E-mail',
  Meeting: 'Reunião',
  Task: 'Tarefa',
  Note: 'Nota',
  StatusChange: 'Mudança de Status',
  StageChange: 'Mudança de Estágio',
  ValueChange: 'Alteração de Valor',
  AssignmentChange: 'Reatribuição',
};

export function LeadActivitiesTimeline({ leadId, activities }: LeadActivitiesTimelineProps) {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [activityType, setActivityType] = useState<ActivityType>('Note');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [activityDate, setActivityDate] = useState(new Date().toISOString().split('T')[0]);

  const addActivityMutation = useMutation({
    mutationFn: () =>
      leadsApi.addActivity(leadId, {
        type: activityType,
        title,
        description,
        activity_date: new Date(activityDate).toISOString(),
      }),
    onSuccess: () => {
      toast.success('Atividade adicionada');
      queryClient.invalidateQueries({ queryKey: ['lead-activities', leadId] });
      setIsAdding(false);
      setTitle('');
      setDescription('');
    },
    onError: () => {
      toast.error('Erro ao adicionar atividade');
    },
  });

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error('Digite um título para a atividade');
      return;
    }
    addActivityMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Timeline de Atividades
          </CardTitle>
          <Button size="sm" variant="outline" onClick={() => setIsAdding(!isAdding)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Atividade
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Activity Form */}
        {isAdding && (
          <Card className="border-primary">
            <CardContent className="space-y-3 pt-6">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Tipo</Label>
                  <Select
                    value={activityType}
                    onValueChange={(v) => setActivityType(v as ActivityType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Call">Ligação</SelectItem>
                      <SelectItem value="Email">E-mail</SelectItem>
                      <SelectItem value="Meeting">Reunião</SelectItem>
                      <SelectItem value="Task">Tarefa</SelectItem>
                      <SelectItem value="Note">Nota</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={activityDate}
                    onChange={(e) => setActivityDate(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>Título</Label>
                <Input
                  placeholder="Ex: Ligação de follow-up"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  placeholder="Detalhes da atividade..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleSubmit} disabled={addActivityMutation.isPending}>
                  {addActivityMutation.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        {activities.length > 0 ? (
          <div className="relative space-y-4 pl-6">
            {/* Vertical line */}
            <div className="absolute bottom-0 left-2 top-0 w-0.5 bg-border" />

            {activities.map((activity) => {
              const Icon = ACTIVITY_ICONS[activity.type] || MessageSquare; // Fallback
              return (
                <div key={activity.id} className="relative">
                  {/* Icon */}
                  <div className="absolute -left-6 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>

                  {/* Content */}
                  <div className="bg-card ml-4 rounded-lg border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {ACTIVITY_LABELS[activity.type] || activity.type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          por {activity.created_by.name}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDateTime(activity.activity_date)}
                      </span>
                    </div>
                    <h4 className="mb-1 font-medium">{activity.title}</h4>
                    {activity.description && (
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                    )}
                    {activity.duration_minutes && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Duração: {activity.duration_minutes} minutos
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            <MessageSquare className="mx-auto mb-4 h-12 w-12 opacity-20" />
            <p>Nenhuma atividade registrada ainda</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
