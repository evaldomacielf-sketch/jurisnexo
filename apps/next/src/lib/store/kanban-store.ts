import { create } from 'zustand';
import type { KanbanColumn, CaseCard, CaseStatus } from '@/lib/types/kanban';
import { MOCK_KANBAN_DATA } from '@/lib/types/kanban';

// ============================================
// 🗄️ Kanban Store (State Management)
// ============================================

interface KanbanStore {
    columns: KanbanColumn[];
    selectedCard: CaseCard | null;
    searchQuery: string;
    filterCategory: string | null;
    filterPriority: string | null;

    isCreateModalOpen: boolean;
    createModalColumnId: CaseStatus | null;

    // Actions
    setColumns: (columns: KanbanColumn[]) => void;
    moveCard: (cardId: string, fromStatus: CaseStatus, toStatus: CaseStatus) => void;
    selectCard: (card: CaseCard | null) => void;
    openCreateModal: (columnId: CaseStatus) => void;
    closeCreateModal: () => void;
    setSearchQuery: (query: string) => void;
    setFilterCategory: (category: string | null) => void;
    setFilterPriority: (priority: string | null) => void;
    updateCard: (cardId: string, updates: Partial<CaseCard>) => void;
    deleteCard: (cardId: string) => void;
    addCard: (columnId: CaseStatus, card: Omit<CaseCard, 'id'>) => void;
}

export const useKanbanStore = create<KanbanStore>((set) => ({
    columns: MOCK_KANBAN_DATA,
    selectedCard: null,
    isCreateModalOpen: false,
    createModalColumnId: null,
    searchQuery: '',
    filterCategory: null,
    filterPriority: null,

    setColumns: (columns) => set({ columns }),

    openCreateModal: (columnId) => set({ isCreateModalOpen: true, createModalColumnId: columnId }),
    closeCreateModal: () => set({ isCreateModalOpen: false, createModalColumnId: null }),

    moveCard: (cardId, fromStatus, toStatus) =>
        set((state) => {
            const newColumns = state.columns.map((col) => {
                // Remove do status antigo
                if (col.id === fromStatus) {
                    return {
                        ...col,
                        cards: col.cards.filter((card) => card.id !== cardId),
                    };
                }
                // Adiciona no novo status
                if (col.id === toStatus) {
                    const cardToMove = state.columns
                        .find((c) => c.id === fromStatus)
                        ?.cards.find((card) => card.id === cardId);

                    if (cardToMove) {
                        return {
                            ...col,
                            cards: [...col.cards, { ...cardToMove, status: toStatus }],
                        };
                    }
                }
                return col;
            });

            return { columns: newColumns };
        }),

    selectCard: (card) => set({ selectedCard: card }),

    setSearchQuery: (query) => set({ searchQuery: query }),

    setFilterCategory: (category) => set({ filterCategory: category }),

    setFilterPriority: (priority) => set({ filterPriority: priority }),

    updateCard: (cardId, updates) =>
        set((state) => ({
            columns: state.columns.map((col) => ({
                ...col,
                cards: col.cards.map((card) =>
                    card.id === cardId ? { ...card, ...updates } : card
                ),
            })),
            selectedCard:
                state.selectedCard?.id === cardId
                    ? { ...state.selectedCard, ...updates }
                    : state.selectedCard,
        })),

    deleteCard: (cardId) =>
        set((state) => ({
            columns: state.columns.map((col) => ({
                ...col,
                cards: col.cards.filter((card) => card.id !== cardId),
            })),
            selectedCard:
                state.selectedCard?.id === cardId ? null : state.selectedCard,
        })),

    addCard: (columnId, cardData) =>
        set((state) => ({
            columns: state.columns.map((col) =>
                col.id === columnId
                    ? {
                        ...col,
                        cards: [
                            ...col.cards,
                            {
                                ...cardData,
                                id: `card-${Date.now()}`,
                                status: columnId,
                            } as CaseCard,
                        ],
                    }
                    : col
            ),
        })),
}));
