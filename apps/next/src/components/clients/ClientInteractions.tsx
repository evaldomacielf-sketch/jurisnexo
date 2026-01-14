'use client';

import { useState, useEffect } from 'react';
import {
    MessageSquare,
    Phone,
    Mail,
    Calendar,
    Plus,
    User,
    ChevronDown
} from 'lucide-react';
import { clientsApi } from '@/lib/api/clients';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { ClientInteraction, InteractionType } from '@/lib/types/client';
import { InteractionType as InteractionTypeEnum, INTERACTION_TYPE_CONFIG } from '@/lib/types/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface ClientInteractionsProps {
    clientId: string;
}

export function ClientInteractions({ clientId }: ClientInteractionsProps) {
    const [interactions, setInteractions] = useState<ClientInteraction[]>([]);
    const [loading, setLoading] = useState(true);
    const [newNote, setNewNote] = useState('');
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (clientId) {
            loadInteractions();
        }
    }, [clientId]);

    const loadInteractions = async () => {
        try {
            const data = await clientsApi.getInteractions(clientId);
            setInteractions(data);
        } catch (error) {
            toast.error('Erro ao carregar interações');
        } finally {
            setLoading(false);
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) {
            toast.error('Digite uma nota antes de salvar');
            return;
        }

        setSaving(true);
        try {
            await clientsApi.createInteraction({
                clientId,
                type: InteractionTypeEnum.NOTE,
                description: newNote,
                created_at: new Date().toISOString(), // Optional, backend handles it usually but DTO might accept it
            } as any); // Casting as CreateInteractionDTO might differ slightly from API expectation or types need update, but let's stick to DTO

            toast.success('Nota adicionada com sucesso');
            setNewNote('');
            setIsAddingNote(false);
            loadInteractions();
        } catch (error) {
            toast.error('Erro ao adicionar nota');
        } finally {
            setSaving(false);
        }
    };

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return '-';
        try {
            return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
        } catch (e) {
            return dateString;
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Histórico de Interações
                    </CardTitle>
                    <button
                        onClick={() => setIsAddingNote(!isAddingNote)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                        <Plus className="h-4 w-4" />
                        Nova Nota
                    </button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Form para adicionar nota */}
                {isAddingNote && (
                    <div className="border border-blue-200 bg-blue-50/30 dark:border-blue-900/50 dark:bg-blue-900/10 rounded-lg p-4 space-y-3">
                        <textarea
                            placeholder="Digite sua nota..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            rows={4}
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-950 dark:text-white"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setIsAddingNote(false);
                                    setNewNote('');
                                }}
                                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddNote}
                                disabled={saving}
                                className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {saving ? 'Salvando...' : 'Salvar Nota'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Timeline de interações */}
                {interactions && interactions.length > 0 ? (
                    <div className="space-y-4">
                        {interactions.map((interaction) => {
                            // Get config or default
                            const config = INTERACTION_TYPE_CONFIG[interaction.type] || INTERACTION_TYPE_CONFIG.other;

                            // Map icon string to component if needed, but INTERACTION_TYPE_CONFIG has icon property which is a string (emoji)
                            // The user code used Lucide icons mapping. Let's recreate that mapping to match user preference for Lucide icons vs Emojis if possible,
                            // or just use the config. Let's stick to the code style provided by user but adapted.

                            // In client.ts, INTERACTION_TYPE_CONFIG uses emojis in 'icon' property.
                            // But here we might want Lucide icons for better look.
                            // Let's map types to Lucide icons.

                            let Icon = MessageSquare;
                            if (interaction.type === InteractionTypeEnum.CALL) Icon = Phone;
                            if (interaction.type === InteractionTypeEnum.EMAIL) Icon = Mail;
                            if (interaction.type === InteractionTypeEnum.MEETING) Icon = Calendar;

                            return (
                                <div
                                    key={interaction.id}
                                    className="flex gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                >
                                    <div className="flex-shrink-0">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 ${config.color}`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex items-center rounded-full border border-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 dark:border-gray-800 dark:text-gray-50">
                                                    {config.label}
                                                </span>
                                                {/* If we had user info in interaction, we would show it here. Assuming userId implies user fetch or we skip it for now */}
                                            </div>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {formatDateTime(interaction.occurredAt || interaction.createdAt)}
                                            </span>
                                        </div>
                                        {interaction.description && (
                                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                {interaction.description}
                                            </p>
                                        )}
                                        {/* Metadata display if needed */}
                                        {(interaction.durationMinutes || interaction.outcome) && (
                                            <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                {interaction.durationMinutes && (
                                                    <span>Duração: {interaction.durationMinutes} min</span>
                                                )}
                                                {interaction.outcome && (
                                                    <span>Resultado: {interaction.outcome}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>Nenhuma interação registrada ainda</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
