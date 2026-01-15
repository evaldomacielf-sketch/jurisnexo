import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  onSchedule: (data: any) => Promise<void>;
}

export function ScheduleMeetingModal({ isOpen, onClose, conversationId, onSchedule }: ScheduleMeetingModalProps) {
  const [title, setTitle] = useState('Reunião de Alinhamento');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [mode, setMode] = useState<'REMOTE' | 'PRESENCIAL'>('REMOTE');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!date || !time) return;

    setLoading(true);
    try {
      const startTime = new Date(`${date}T${time}`).toISOString();
      const endTime = new Date(new Date(startTime).getTime() + parseInt(duration) * 60000).toISOString();

      await onSchedule({
        conversationId,
        title,
        startTime,
        endTime,
        mode
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Erro ao agendar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agendar Reunião</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Data</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Hora (Início)</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Duração (min)</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="90">1h 30min</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Modo</Label>
              <Select value={mode} onValueChange={(v: 'REMOTE' | 'PRESENCIAL') => setMode(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="REMOTE">Remoto (Google Meet)</SelectItem>
                  <SelectItem value="PRESENCIAL">Presencial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={loading}>{loading ? 'Agendando...' : 'Confirmar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
