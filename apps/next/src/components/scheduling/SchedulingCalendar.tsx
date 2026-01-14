'use client';

import { useState, useEffect } from 'react';
import {
    Calendar as CalendarIcon,
    Plus,
    Clock,
    Video,
    User,
    ChevronLeft,
    ChevronRight,
    X
} from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { ptBR } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';
import { schedulingApi } from '@/lib/api/scheduling';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { AppointmentForm } from './AppointmentForm';
import { Appointment, AppointmentStatus } from '@/lib/types/scheduling';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function SchedulingCalendar() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAppointments();
    }, [currentMonth]);

    const loadAppointments = async () => {
        try {
            setLoading(true);
            const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
            const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

            const data = await schedulingApi.getAppointments({ startDate: start, endDate: end });
            setAppointments(data);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar agenda');
        } finally {
            setLoading(false);
        }
    };

    const dailyAppointments = appointments.filter((apt) => {
        const aptDate = new Date(apt.start_time);
        return (
            aptDate.getDate() === selectedDate.getDate() &&
            aptDate.getMonth() === selectedDate.getMonth() &&
            aptDate.getFullYear() === selectedDate.getFullYear()
        );
    }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    const datesWithAppointments = appointments.map((apt) =>
        new Date(apt.start_time).toDateString()
    );

    const formatTime = (dateStr: string) => {
        return format(new Date(dateStr), 'HH:mm');
    };

    const formatDateStr = (date: Date) => {
        return format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
    }

    // Custom styling for DayPicker to match Tailwind/shadcn somewhat
    const css = `
    .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover {
        background-color: #2563eb;
        color: white;
    }
    .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
        background-color: #f3f4f6;
    }
  `;

    return (
        <div className="space-y-6">
            <style>{css}</style>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-gray-900 dark:text-white">
                        <CalendarIcon className="h-8 w-8" />
                        Agenda
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Gerencie seus compromissos e reuniões
                    </p>
                </div>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4" />
                    Novo Agendamento
                </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Calendar */}
                <Card className="lg:col-span-1">
                    <CardContent className="pt-6 flex flex-col items-center">
                        <DayPicker
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && setSelectedDate(date)}
                            month={currentMonth}
                            onMonthChange={setCurrentMonth}
                            locale={ptBR}
                            modifiers={{
                                hasEvent: (date) => datesWithAppointments.includes(date.toDateString())
                            }}
                            modifiersStyles={{
                                hasEvent: {
                                    fontWeight: 'bold',
                                    textDecoration: 'underline',
                                    textDecorationColor: '#2563eb'
                                }
                            }}
                        />
                        <button
                            onClick={() => {
                                const today = new Date();
                                setSelectedDate(today);
                                setCurrentMonth(today);
                            }}
                            className="mt-4 w-full py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                            Ir para Hoje
                        </button>
                    </CardContent>
                </Card>

                {/* Daily Schedule */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
                                {formatDateStr(selectedDate)}
                            </h2>
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                {dailyAppointments.length} compromissos
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                            </div>
                        ) : dailyAppointments && dailyAppointments.length > 0 ? (
                            <div className="space-y-3">
                                {dailyAppointments.map((appointment) => (
                                    <div
                                        key={appointment.id}
                                        className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                                        onClick={() => setSelectedAppointment(appointment)}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-gray-500" />
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                                                    </span>
                                                    {appointment.is_online && (
                                                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                            <Video className="h-3 w-3 mr-1" />
                                                            Online
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white">{appointment.title}</h4>
                                                {appointment.description && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                                        {appointment.description}
                                                    </p>
                                                )}
                                                {/* Participants would go here */}
                                            </div>
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${appointment.status === AppointmentStatus.CONFIRMED ? 'bg-green-100 text-green-800' :
                                                appointment.status === AppointmentStatus.CANCELLED ? 'bg-red-100 text-red-800' :
                                                    appointment.status === AppointmentStatus.COMPLETED ? 'bg-gray-100 text-gray-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {appointment.status === AppointmentStatus.CONFIRMED && 'Confirmado'}
                                                {appointment.status === AppointmentStatus.SCHEDULED && 'Agendado'}
                                                {appointment.status === AppointmentStatus.CANCELLED && 'Cancelado'}
                                                {appointment.status === AppointmentStatus.COMPLETED && 'Concluído'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                <CalendarIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
                                <p className="text-lg font-medium mb-2">
                                    Nenhum compromisso para esta data
                                </p>
                                <p className="text-sm">
                                    Clique em "Novo Agendamento" para criar um
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Create Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl my-8">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Novo Agendamento</h3>
                            <button onClick={() => setIsCreateOpen(false)} aria-label="Fechar modal" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <AppointmentForm
                                defaultDate={selectedDate}
                                onSuccess={() => {
                                    setIsCreateOpen(false);
                                    loadAppointments();
                                }}
                                onCancel={() => setIsCreateOpen(false)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {selectedAppointment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate pr-4">{selectedAppointment.title}</h3>
                            <button onClick={() => setSelectedAppointment(null)} aria-label="Fechar modal" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex-shrink-0">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <Clock className="h-4 w-4" />
                                <span>
                                    {formatTime(selectedAppointment.start_time)} - {formatTime(selectedAppointment.end_time)}
                                </span>
                            </div>
                            {selectedAppointment.description && (
                                <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-md">
                                    {selectedAppointment.description}
                                </div>
                            )}
                            {selectedAppointment.is_online && selectedAppointment.meet_link && (
                                <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                                    <Video className="h-4 w-4 text-blue-600 mt-0.5" />
                                    <div className="overflow-hidden">
                                        <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Reunião Online</p>
                                        <a href={selectedAppointment.meet_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all block">
                                            {selectedAppointment.meet_link}
                                        </a>
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-2 pt-4">
                                <button className="flex-1 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                                    Editar
                                </button>
                                <button
                                    onClick={async () => {
                                        if (confirm('Cancelar este agendamento?')) {
                                            try {
                                                await schedulingApi.deleteAppointment(selectedAppointment.id);
                                                toast.success('Agendamento cancelado');
                                                setSelectedAppointment(null);
                                                loadAppointments();
                                            } catch (e) {
                                                toast.error('Erro ao cancelar');
                                            }
                                        }
                                    }}
                                    className="flex-1 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
