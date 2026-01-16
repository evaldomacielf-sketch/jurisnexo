'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    Link as LinkIcon,
    Briefcase,
    User,
    Settings,
    Check,
    X,
    Loader2,
    Video,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { calendarApi, CalendarEvent, EventType, CreateEventDto } from '@/services/api/calendar.service';
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
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-100 rounded-xl">
                            <CalendarIcon className="w-6 h-6 text-indigo-600" />
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
                                className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
                            >
                                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                                Conectar Google
                            </button>
                        ) : (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm">
                                <Check className="w-4 h-4" />
                                Google conectado
                            </div>
                        )}
                        <button
                            onClick={() => setShowNewEventModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            <Plus className="w-5 h-5" />
                            Novo Evento
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between bg-white p-4 rounded-t-xl border border-b-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handlePrevMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            aria-label="Mês anterior"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-semibold text-gray-900 min-w-[200px] text-center">
                            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                        </h2>
                        <button
                            onClick={handleNextMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            aria-label="Próximo mês"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                    <button
                        onClick={handleToday}
                        className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium"
                    >
                        Hoje
                    </button>
                </div>

                {/* Calendar Grid */}
                <div className="bg-white rounded-b-xl border overflow-hidden">
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
                        <div className="h-[500px] flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
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
                                        className={`min-h-[100px] border-b border-r p-2 ${!isCurrentMonth ? 'bg-gray-50' : ''
                                            }`}
                                    >
                                        <div
                                            className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${isToday
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
                                                        "w-full text-left text-xs p-1 rounded truncate text-white",
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
                            <div
                                className={cn("w-3 h-3 rounded-full", getEventColorClass(type as EventType))}
                            />
                            <span className="text-sm text-gray-600">{label}</span>
                        </div>
                    ))}
                </div>

                {/* Event Details Modal */}
                {selectedEvent && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl max-w-md w-full mx-4 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div
                                    className={cn("px-3 py-1 rounded-full text-white text-sm font-medium", getEventColorClass(selectedEvent.type))}
                                >
                                    {EVENT_LABELS[selectedEvent.type]}
                                </div>
                                <button
                                    onClick={() => setSelectedEvent(null)}
                                    className="p-1 hover:bg-gray-100 rounded"
                                    aria-label="Fechar"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-4">{selectedEvent.title}</h3>

                            {selectedEvent.description && (
                                <p className="text-gray-600 mb-4">{selectedEvent.description}</p>
                            )}

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Clock className="w-5 h-5" />
                                    <span>
                                        {format(parseISO(selectedEvent.startDate), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                        {selectedEvent.allDay ? ' (dia inteiro)' : ''}
                                    </span>
                                </div>

                                {selectedEvent.location && (
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <MapPin className="w-5 h-5" />
                                        <span>{selectedEvent.location}</span>
                                    </div>
                                )}

                                {selectedEvent.videoLink && (
                                    <div className="flex items-center gap-3">
                                        <Video className="w-5 h-5 text-gray-600" />
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

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setSelectedEvent(null)}
                                    className="flex-1 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    Fechar
                                </button>
                                <button className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
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
