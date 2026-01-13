'use client';

import { useState } from 'react';
import { Bell, X, Check, Clock, MessageSquare, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ============================================
// 🔔 Notification Center
// ============================================

interface Notification {
    id: string;
    type: 'message' | 'case' | 'system';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    link?: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        type: 'message',
        title: 'Nova mensagem de João Pereira',
        message: 'Você já revisou o contrato?',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        read: false,
    },
    {
        id: '2',
        type: 'case',
        title: 'Caso atualizado',
        message: 'O caso de Sara Santos foi movido para Triagem',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: false,
    },
    {
        id: '3',
        type: 'system',
        title: 'Período trial expirando',
        message: 'Faltam 7 dias para o fim do seu período trial',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        read: true,
    },
];

export function NotificationCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const deleteNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'message':
                return MessageSquare;
            case 'case':
                return FileText;
            default:
                return Bell;
        }
    };

    return (
        <div className="relative">
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Panel */}
                    <div className="absolute right-0 top-12 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 animate-in slide-in-from-top-5 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="font-bold text-gray-900 dark:text-white">
                                Notificações
                                {unreadCount > 0 && (
                                    <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-primary hover:underline font-medium"
                                >
                                    Marcar todas como lidas
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                    <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Nenhuma notificação</p>
                                </div>
                            ) : (
                                notifications.map((notification) => {
                                    const Icon = getIcon(notification.type);
                                    return (
                                        <div
                                            key={notification.id}
                                            className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${!notification.read ? 'bg-primary/5' : ''
                                                }`}
                                        >
                                            <div className="flex gap-3">
                                                <div
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notification.type === 'message'
                                                            ? 'bg-blue-100 text-blue-600'
                                                            : notification.type === 'case'
                                                                ? 'bg-green-100 text-green-600'
                                                                : 'bg-orange-100 text-orange-600'
                                                        }`}
                                                >
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                                                            {notification.title}
                                                        </h4>
                                                        <button
                                                            onClick={() => deleteNotification(notification.id)}
                                                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {formatDistanceToNow(notification.timestamp, {
                                                                locale: ptBR,
                                                                addSuffix: true,
                                                            })}
                                                        </span>
                                                        {!notification.read && (
                                                            <button
                                                                onClick={() => markAsRead(notification.id)}
                                                                className="text-xs text-primary hover:underline flex items-center gap-1"
                                                            >
                                                                <Check className="w-3 h-3" />
                                                                Marcar como lida
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                            <button className="text-sm text-primary hover:underline font-medium">
                                Ver todas as notificações
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
