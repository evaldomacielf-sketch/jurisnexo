'use client';

import React, { useState, useEffect } from 'react';
import { ConversationList } from '../../../components/inbox/ConversationList';
import { ChatWindow } from '../../../components/crm/ChatWindow';

// MOCK DATA for initial render (until API is connected via proxy/env)
// In real world, we would use SWR or React Query to fetch from /api/crm/...
const MOCK_CONVERSATIONS = [
  {
    id: '1',
    contact: { name: 'João Silva', phone: '+5511999999999' },
    urgency: 'NORMAL',
    status: 'OPEN',
    last_message: {
      content: 'Olá, gostaria de saber sobre o processo',
      created_at: new Date().toISOString(),
    },
  },
  {
    id: '2',
    contact: { name: 'Maria Souza', phone: '+5511988888888' },
    urgency: 'HIGH',
    status: 'OPEN',
    last_message: {
      content: 'Preciso falar com advogado urgente sobre a audiência',
      created_at: new Date().toISOString(),
    },
  },
  {
    id: '3',
    contact: { name: 'Carlos Preso', phone: '+5511977777777' },
    urgency: 'PLANTAO',
    status: 'OPEN',
    last_message: {
      content: 'SOCORRO URGENTE PRESO MANDADO',
      created_at: new Date().toISOString(),
    },
  },
] as any[];

export default function CrmInboxPage() {
  const [conversations] = useState<any[]>(MOCK_CONVERSATIONS);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<any[]>([]);

  // Fetch Conversations (Simulated)
  useEffect(() => {
    // async function load() {
    //   const res = await fetch('/api/crm/conversations');
    //   const data = await res.json();
    //   setConversations(data);
    // }
    // load();
  }, []);

  // Fetch Messages when selected
  useEffect(() => {
    if (!selectedId) return;

    // Simulate fetching messages
    const mockMsgs = [
      {
        id: 'm1',
        content: 'Olá, tudo bem?',
        direction: 'OUTBOUND',
        status: 'SENT',
        created_at: new Date(Date.now() - 10000).toISOString(),
      },
      {
        id: 'm2',
        content: conversations.find((c) => c.id === selectedId)?.last_message?.content || '...',
        direction: 'INBOUND',
        status: 'DELIVERED',
        created_at: new Date().toISOString(),
      },
    ];
    setMessages(mockMsgs);
  }, [selectedId, conversations]);

  const handleSendMessage = async (content: string) => {
    if (!selectedId) return;

    // Optimistic Update
    const tempMsg = {
      id: 'temp-' + Date.now(),
      content,
      direction: 'OUTBOUND',
      status: 'QUEUED',
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    // Call API
    // await fetch(\`/api/crm/conversations/\${selectedId}/messages\`, {
    //   method: 'POST',
    //   body: JSON.stringify({ content }),
    //   headers: { 'Content-Type': 'application/json' }
    // });

    // Mock success
    setTimeout(() => {
      setMessages((prev) => prev.map((m) => (m.id === tempMsg.id ? { ...m, status: 'SENT' } : m)));
    }, 1000);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      <ConversationList
        conversations={conversations}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      <div className="flex-1 bg-slate-100 p-4">
        {selectedId ? (
          <ChatWindow
            conversationId={selectedId}
            messages={messages}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            Selecione uma conversa para iniciar o atendimento.
          </div>
        )}
      </div>
    </div>
  );
}
