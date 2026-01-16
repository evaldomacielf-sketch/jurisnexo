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
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
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
        className="relative rounded-full p-2 text-gray-600 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500 dark:border-gray-800"></span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Panel */}
          <div className="absolute right-0 top-12 z-50 w-96 rounded-xl border border-gray-200 bg-white shadow-2xl duration-200 animate-in slide-in-from-top-5 dark:border-gray-700 dark:bg-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white">
                Notificações
                {unreadCount > 0 && (
                  <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-white">
                    {unreadCount}
                  </span>
                )}
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <Bell className="mx-auto mb-2 h-12 w-12 opacity-50" />
                  <p className="text-sm">Nenhuma notificação</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const Icon = getIcon(notification.type);
                  return (
                    <div
                      key={notification.id}
                      className={`border-b border-gray-100 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50 ${
                        !notification.read ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div
                          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                            notification.type === 'message'
                              ? 'bg-blue-100 text-blue-600'
                              : notification.type === 'case'
                                ? 'bg-green-100 text-green-600'
                                : 'bg-orange-100 text-orange-600'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-start justify-between gap-2">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                              {notification.title}
                            </h4>
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              aria-label="Excluir notificação"
                              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="mb-2 text-xs text-gray-600 dark:text-gray-400">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(notification.timestamp, {
                                locale: ptBR,
                                addSuffix: true,
                              })}
                            </span>
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="flex items-center gap-1 text-xs text-primary hover:underline"
                              >
                                <Check className="h-3 w-3" />
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
            <div className="border-t border-gray-200 p-3 text-center dark:border-gray-700">
              <button className="text-sm font-medium text-primary hover:underline">
                Ver todas as notificações
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
