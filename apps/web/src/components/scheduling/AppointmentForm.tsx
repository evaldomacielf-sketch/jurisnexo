'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Video, MapPin, X } from 'lucide-react';
import { schedulingApi } from '@/lib/api/scheduling';
import toast from 'react-hot-toast';
import { AppointmentStatus, AppointmentType } from '@/lib/types/scheduling';

const appointmentSchema = z.object({
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),
  start_time: z.string(),
  end_time: z.string(),
  is_online: z.boolean().default(false),
  location: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface AppointmentFormProps {
  defaultDate?: Date;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AppointmentForm({
  defaultDate = new Date(),
  onSuccess,
  onCancel,
}: AppointmentFormProps) {
  const [loading, setLoading] = useState(false);

  // Helper to format date for datetime-local input (YYYY-MM-DDThh:mm)
  const formatDateTimeLocal = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      title: '',
      description: '',
      start_time: formatDateTimeLocal(defaultDate),
      end_time: formatDateTimeLocal(new Date(defaultDate.getTime() + 60 * 60 * 1000)), // +1 hour
      is_online: false,
      location: '',
    },
  });

  const isOnline = watch('is_online');

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      setLoading(true);
      await schedulingApi.createAppointment({
        ...data,
        type: AppointmentType.MEETING, // Default
        status: AppointmentStatus.SCHEDULED, // Default
        meet_link: data.is_online ? 'https://meet.google.com/new' : undefined, // Placeholder logic
      });

      toast.success('Agendamento criado com sucesso');
      onSuccess?.();
    } catch (error) {
      toast.error('Erro ao criar agendamento');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Title */}
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Título *
        </label>
        <input
          {...register('title')}
          placeholder="Ex: Reunião com cliente"
          className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-50"
        />
        {errors.title && <p className="text-sm font-medium text-red-500">{errors.title.message}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Descrição
        </label>
        <textarea
          {...register('description')}
          placeholder="Detalhes do compromisso..."
          rows={3}
          className="flex w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-50"
        />
      </div>

      {/* Times */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Início *
          </label>
          <input
            type="datetime-local"
            {...register('start_time')}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-50"
          />
          {errors.start_time && (
            <p className="text-sm font-medium text-red-500">{errors.start_time.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Término *
          </label>
          <input
            type="datetime-local"
            {...register('end_time')}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-50"
          />
          {errors.end_time && (
            <p className="text-sm font-medium text-red-500">{errors.end_time.message}</p>
          )}
        </div>
      </div>

      {/* Online Switch */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <div className="space-y-0.5">
          <label className="text-base font-medium">Reunião Online</label>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gerar link do Google Meet automaticamente
          </p>
        </div>
        <div className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            id="is_online"
            className="peer sr-only"
            {...register('is_online')}
          />
          <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
          <label htmlFor="is_online" className="sr-only">
            Toggle online meeting
          </label>
        </div>
      </div>

      {/* Location */}
      {!isOnline && (
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Local
          </label>
          <div className="relative">
            <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <input
              {...register('location')}
              placeholder="Endereço do compromisso"
              className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 pl-9 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-50"
            />
          </div>
          {errors.location && (
            <p className="text-sm font-medium text-red-500">{errors.location.message}</p>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white ring-offset-background transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          {loading ? 'Criando...' : 'Criar Agendamento'}
        </button>
      </div>
    </form>
  );
}
