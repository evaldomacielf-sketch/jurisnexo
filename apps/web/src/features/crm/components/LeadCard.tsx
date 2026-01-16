import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { User, Calendar, DollarSign, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Changed from react-router-dom to next/navigation for Next.js
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Lead } from '@/types/leads';

interface LeadCardProps {
  lead: Lead;
  isDragging?: boolean;
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-500',
  medium: 'bg-blue-500',
  high: 'bg-orange-500',
  very_high: 'bg-red-500',
};

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  very_high: 'Muito Alta',
};

export function LeadCard({ lead, isDragging }: LeadCardProps) {
  const router = useRouter(); // Changed from useNavigate

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-grab transition-shadow hover:shadow-md active:cursor-grabbing ${
        isDragging ? 'shadow-lg ring-2 ring-primary' : ''
      }`}
      {...attributes}
      {...listeners}
    >
      <CardContent className="space-y-3 p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">{lead.title}</h3>
            {lead.description && (
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{lead.description}</p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/crm/leads/${lead.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/crm/leads/${lead.id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Remover
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Contact */}
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="truncate">{lead.contact.name}</span>
        </div>

        {/* Value & Probability */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 font-semibold text-green-600">
            <DollarSign className="h-4 w-4" />
            {formatCurrency(lead.estimated_value)}
          </div>
          <Badge variant="outline" className="text-xs">
            {lead.probability}%
          </Badge>
        </div>

        {/* Expected Close Date */}
        {lead.expected_close_date && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Previsão: {formatDate(lead.expected_close_date)}</span>
          </div>
        )}

        {/* Priority Badge */}
        <div className="flex items-center justify-between">
          <Badge
            variant="secondary"
            className={`text-xs ${PRIORITY_COLORS[lead.priority] || 'bg-gray-500'} text-white`}
          >
            {PRIORITY_LABELS[lead.priority] || lead.priority}
          </Badge>

          {/* Assigned User */}
          {lead.assigned_to_user && (
            <Avatar className="h-6 w-6">
              <AvatarImage src={lead.assigned_to_user.avatar_url} />
              <AvatarFallback className="text-xs">
                {lead.assigned_to_user.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>

        {/* Tags */}
        {lead.tags && lead.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {lead.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {lead.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{lead.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
