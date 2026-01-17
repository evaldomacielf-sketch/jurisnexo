import { MessageCircle, Send } from 'lucide-react';

export default function WhatsAppPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">WhatsApp</h1>
        <button className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">
          <Send className="h-5 w-5" />
          Nova Mensagem
        </button>
      </div>

      {/* Chat Interface */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Conversations List */}
        <div className="lg:col-span-1 rounded-lg border bg-white p-4">
          <h2 className="font-bold mb-4">Conversas</h2>
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma conversa</p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3 rounded-lg border bg-white p-6">
          <div className="text-center py-16 text-gray-500">
            <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Selecione uma conversa para começar</p>
          </div>
        </div>
      </div>
    </div>
  );
}
