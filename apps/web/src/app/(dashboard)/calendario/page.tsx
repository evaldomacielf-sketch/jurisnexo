'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Check,
  X,
  Loader2,
  Video,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  calendarApi,
  CalendarEvent,
  EventType,
  CreateEventDto,
} from '@/services/api/calendar.service';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  parseISO,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

const EVENT_COLORS: Record<EventType, string> = {
  [EventType.AUDIENCIA]: '#ef4444',
  [EventType.REUNIAO]: '#3b82f6',
  [EventType.PRAZO]: '#f59e0b',
  [EventType.CONSULTA]: '#10b981',
  [EventType.DEPOIMENTO]: '#8b5cf6',
  [EventType.PERICIA]: '#ec4899',
  [EventType.MEDIACAO]: '#6366f1',
  [EventType.OUTRO]: '#6b7280',
};

const EVENT_LABELS: Record<EventType, string> = {
  [EventType.AUDIENCIA]: 'Audiência',
  [EventType.REUNIAO]: 'Reunião',
  [EventType.PRAZO]: 'Prazo',
  [EventType.CONSULTA]: 'Consulta',
  [EventType.DEPOIMENTO]: 'Depoimento',
  [EventType.PERICIA]: 'Perícia',
  [EventType.MEDIACAO]: 'Mediação',
  [EventType.OUTRO]: 'Outro',
};

const getEventColorClass = (type: EventType) => {
  const classes: Record<EventType, string> = {
    [EventType.AUDIENCIA]: 'bg-red-500',
    [EventType.REUNIAO]: 'bg-blue-500',
    [EventType.PRAZO]: 'bg-amber-500',
    [EventType.CONSULTA]: 'bg-emerald-500',
    [EventType.DEPOIMENTO]: 'bg-violet-500',
    [EventType.PERICIA]: 'bg-pink-500',
    [EventType.MEDIACAO]: 'bg-indigo-500',
    [EventType.OUTRO]: 'bg-gray-500',
  };
  return classes[type] || classes[EventType.OUTRO];
};

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);

  useEffect(() => {
    loadEvents();
    checkGoogleStatus();
  }, [currentDate]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      const data = await calendarApi.getEvents(start.toISOString(), end.toISOString());
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkGoogleStatus = async () => {
    try {
      const connected = await calendarApi.getGoogleStatus();
      setGoogleConnected(connected);
    } catch {
      setGoogleConnected(false);
    }
  };

  const connectGoogle = async () => {
    try {
      const authUrl = await calendarApi.getGoogleAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error connecting to Google:', error);
    }
  };

  // Calendar grid
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentDate]);

  const getEventsForDay = (day: Date) =>
    events.filter((e) => isSameDay(parseISO(e.startDate), day));

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-indigo-100 p-3">
              <CalendarIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Calendário</h1>
              <p className="text-gray-500">Gerencie seus eventos e compromissos</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!googleConnected ? (
              <button
                onClick={connectGoogle}
                className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 hover:bg-gray-50"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="h-4 w-4" />
                Conectar Google
              </button>
            ) : (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-1.5 text-sm text-green-700">
                <Check className="h-4 w-4" />
                Google conectado
              </div>
            )}
            <button
              onClick={() => setShowNewEventModal(true)}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            >
              <Plus className="h-5 w-5" />
              Novo Evento
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between rounded-t-xl border border-b-0 bg-white p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrevMonth}
              className="rounded-lg p-2 hover:bg-gray-100"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="min-w-[200px] text-center text-xl font-semibold text-gray-900">
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <button
              onClick={handleNextMonth}
              className="rounded-lg p-2 hover:bg-gray-100"
              aria-label="Próximo mês"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <button
            onClick={handleToday}
            className="rounded-lg px-4 py-2 font-medium text-indigo-600 hover:bg-indigo-50"
          >
            Hoje
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="overflow-hidden rounded-b-xl border bg-white">
          {/* Week days header */}
          <div className="grid grid-cols-7 border-b">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
              <div key={day} className="py-3 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          {loading ? (
            <div className="flex h-[500px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : (
            <div className="grid grid-cols-7">
              {calendarDays.map((day, idx) => {
                const dayEvents = getEventsForDay(day);
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, currentDate);

                return (
                  <div
                    key={idx}
                    className={`min-h-[100px] border-b border-r p-2 ${
                      !isCurrentMonth ? 'bg-gray-50' : ''
                    }`}
                  >
                    <div
                      className={`mb-1 flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
                        isToday
                          ? 'bg-indigo-600 text-white'
                          : isCurrentMonth
                            ? 'text-gray-900'
                            : 'text-gray-400'
                      }`}
                    >
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <button
                          key={event.id}
                          onClick={() => setSelectedEvent(event)}
                          className={cn(
                            'w-full truncate rounded p-1 text-left text-xs text-white',
                            getEventColorClass(event.type)
                          )}
                        >
                          {event.title}
                        </button>
                      ))}
                      {dayEvents.length > 3 && (
                        <p className="text-xs text-gray-500">+{dayEvents.length - 3} mais</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Event Types Legend */}
        <div className="mt-4 flex flex-wrap gap-4">
          {Object.entries(EVENT_LABELS).map(([type, label]) => (
            <div key={type} className="flex items-center gap-2">
              <div className={cn('h-3 w-3 rounded-full', getEventColorClass(type as EventType))} />
              <span className="text-sm text-gray-600">{label}</span>
            </div>
          ))}
        </div>

        {/* Event Details Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6">
              <div className="mb-4 flex items-start justify-between">
                <div
                  className={cn(
                    'rounded-full px-3 py-1 text-sm font-medium text-white',
                    getEventColorClass(selectedEvent.type)
                  )}
                >
                  {EVENT_LABELS[selectedEvent.type]}
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="rounded p-1 hover:bg-gray-100"
                  aria-label="Fechar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <h3 className="mb-4 text-xl font-bold text-gray-900">{selectedEvent.title}</h3>

              {selectedEvent.description && (
                <p className="mb-4 text-gray-600">{selectedEvent.description}</p>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <Clock className="h-5 w-5" />
                  <span>
                    {format(parseISO(selectedEvent.startDate), "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })}
                    {selectedEvent.allDay ? ' (dia inteiro)' : ''}
                  </span>
                </div>

                {selectedEvent.location && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin className="h-5 w-5" />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}

                {selectedEvent.videoLink && (
                  <div className="flex items-center gap-3">
                    <Video className="h-5 w-5 text-gray-600" />
                    <a
                      href={selectedEvent.videoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline"
                    >
                      Entrar na videochamada
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 rounded-lg border py-2 hover:bg-gray-50"
                >
                  Fechar
                </button>
                <button className="flex-1 rounded-lg bg-indigo-600 py-2 text-white hover:bg-indigo-700">
                  Editar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
