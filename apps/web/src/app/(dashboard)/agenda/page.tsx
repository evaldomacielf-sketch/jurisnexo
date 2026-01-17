import { Calendar } from 'lucide-react';

export const metadata = {
  title: 'Agenda | JurisNexo',
};

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Agenda</h1>
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          <Calendar className="h-5 w-5" />
          Novo Compromisso
        </button>
      </div>

      {/* Calendar View */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-lg border bg-white p-6">
          <h2 className="font-bold mb-4">Calendário</h2>
          <div className="text-center py-12 text-gray-500">
            <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Calendário em desenvolvimento</p>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <h3 className="font-bold mb-4">Próximos Compromissos</h3>
          <div className="text-center py-8 text-gray-500">
            <p>Nenhum compromisso agendado</p>
          </div>
        </div>
      </div>
    </div>
  );
}
