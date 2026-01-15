'use client';

import React, { useState } from 'react';
import {
    DragDropContext,
    Droppable,
    Draggable,
    type DropResult,
} from '@hello-pangea/dnd';
import type { LeadDto, LeadStatus } from '@/lib/types/leads';
import { useUpdateLeadStatus } from '@/hooks/useLeads';
import {
    UserIcon,
    FireIcon,
    PhoneIcon,
} from '@heroicons/react/24/outline';

interface LeadKanbanBoardProps {
    leads?: LeadDto[];
    isLoading?: boolean;
    onLeadClick?: (leadId: string) => void;
}

interface KanbanColumn {
    id: string;
    title: string;
    status: LeadStatus;
    color: string;
    bgColor: string;
    borderColor: string;
}

const COLUMNS: KanbanColumn[] = [
    { id: 'new', title: 'Novos', status: 'New', color: 'text-blue-700', bgColor: 'bg-blue-100', borderColor: 'border-blue-400' },
    { id: 'qualifying', title: 'Em Qualificação', status: 'Qualifying', color: 'text-yellow-700', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-400' },
    { id: 'qualified', title: 'Qualificados', status: 'Qualified', color: 'text-green-700', bgColor: 'bg-green-100', borderColor: 'border-green-400' },
    { id: 'assigned', title: 'Atribuídos', status: 'Assigned', color: 'text-cyan-700', bgColor: 'bg-cyan-100', borderColor: 'border-cyan-400' },
    { id: 'contacted', title: 'Contatados', status: 'Contacted', color: 'text-purple-700', bgColor: 'bg-purple-100', borderColor: 'border-purple-400' },
    { id: 'negotiating', title: 'Negociando', status: 'Negotiating', color: 'text-orange-700', bgColor: 'bg-orange-100', borderColor: 'border-orange-400' },
    { id: 'won', title: 'Convertidos', status: 'Won', color: 'text-emerald-700', bgColor: 'bg-emerald-100', borderColor: 'border-emerald-400' },
];

const getQualityStyles = (quality: string) => {
    switch (quality.toLowerCase()) {
        case 'high':
            return 'bg-green-100 text-green-700';
        case 'medium':
            return 'bg-yellow-100 text-yellow-700';
        case 'low':
            return 'bg-red-100 text-red-700';
        default:
            return 'bg-gray-100 text-gray-700';
    }
};

const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};

export default function LeadKanbanBoard({ leads = [], isLoading, onLeadClick }: LeadKanbanBoardProps) {
    const updateStatus = useUpdateLeadStatus();

    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination) return;

        const leadId = result.draggableId;
        const newStatus = result.destination.droppableId as LeadStatus;
        const oldStatus = result.source.droppableId as LeadStatus;

        if (newStatus === oldStatus) return;

        updateStatus.mutate({ leadId, status: newStatus });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4 p-6 h-full overflow-x-auto">
                {COLUMNS.map((column) => {
                    const columnLeads = leads.filter((l) => l.status === column.status);

                    return (
                        <Droppable key={column.id} droppableId={column.status}>
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`flex-shrink-0 w-80 rounded-xl transition-colors ${snapshot.isDraggingOver ? 'bg-gray-200' : 'bg-gray-100'
                                        }`}
                                >
                                    {/* Column Header */}
                                    <div className={`p-4 border-b-2 ${column.borderColor} rounded-t-xl`}>
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-gray-900">{column.title}</h3>
                                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${column.bgColor} ${column.color}`}>
                                                {columnLeads.length}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Cards */}
                                    <div className="p-3 space-y-3 min-h-[200px]">
                                        {columnLeads.map((lead, index) => (
                                            <Draggable key={lead.id} draggableId={lead.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        onClick={() => onLeadClick?.(lead.id)}
                                                        className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-all ${snapshot.isDragging ? 'shadow-lg rotate-2 opacity-90' : ''
                                                            }`}
                                                    >
                                                        {/* Score Badge & Urgency */}
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className={`px-2 py-1 text-xs rounded-full font-semibold ${getQualityStyles(lead.quality)}`}>
                                                                {lead.score}/100
                                                            </span>
                                                            {lead.urgency === 'Critical' && (
                                                                <FireIcon className="w-5 h-5 text-red-500" />
                                                            )}
                                                        </div>

                                                        {/* Lead Name */}
                                                        <h4 className="font-semibold text-gray-900 mb-1 truncate">
                                                            {lead.name}
                                                        </h4>

                                                        {/* Phone */}
                                                        <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                                                            <PhoneIcon className="w-3 h-3" />
                                                            {lead.phoneNumber}
                                                        </p>

                                                        {/* Case Type */}
                                                        {lead.caseType && (
                                                            <p className="text-sm text-gray-600 mb-2">
                                                                📋 {lead.caseType}
                                                            </p>
                                                        )}

                                                        {/* Footer */}
                                                        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                                                            <span>{formatRelativeTime(lead.assignedAt)}</span>
                                                            {lead.assignedToUserName && (
                                                                <span className="flex items-center gap-1 text-blue-600">
                                                                    <UserIcon className="w-3 h-3" />
                                                                    {lead.assignedToUserName}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}

                                        {columnLeads.length === 0 && (
                                            <div className="text-center py-8 text-gray-400 text-sm">
                                                Arraste leads aqui
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </Droppable>
                    );
                })}
            </div>
        </DragDropContext>
    );
}
