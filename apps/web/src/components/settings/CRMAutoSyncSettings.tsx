'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface CRMAutoSyncSettings {
  id: string;
  escritorioId: string;
  syncOnLeadCreated: boolean;
  syncOnLeadQualified: boolean;
  syncOnLeadConverted: boolean;
  syncOnContactUpdated: boolean;
  syncOnCaseCreated: boolean;
  syncOnlyHighQualityLeads: boolean;
  caseTypesToSync: string[];
  sourcesToSync: number[];
  maxRetryAttempts: number;
  retryDelayMinutes: number;
  salesforceEnabled: boolean;
  hubspotEnabled: boolean;
  pipedriveEnabled: boolean;
  rdstationEnabled: boolean;
}

export default function CRMAutoSyncSettings() {
  const { data: settings, refetch } = useQuery<CRMAutoSyncSettings>({
    queryKey: ['crm-autosync-settings'],
    queryFn: () => api.get('/integrations/crm/settings/auto-sync').then((res) => res.data),
  });

  const updateSettings = useMutation({
    mutationFn: (data: CRMAutoSyncSettings) =>
      api.put('/integrations/crm/settings/auto-sync', data),
    onSuccess: () => refetch(),
  });

  const [formData, setFormData] = useState<CRMAutoSyncSettings | null>(null);

  useEffect(() => {
    if (settings) setFormData(settings);
  }, [settings]);

  const handleSave = () => {
    if (formData) {
      updateSettings.mutate(formData);
      toast.success('Configurações salvas com sucesso!');
    }
  };

  if (!formData) return <div>Carregando...</div>;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Configurações de Sincronização Automática
      </h1>

      {/* CRMs Habilitados */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">CRMs Habilitados</h2>

        <div className="space-y-3">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={formData.salesforceEnabled}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  salesforceEnabled: e.target.checked,
                })
              }
              className="h-5 w-5 rounded text-blue-600"
            />
            <div className="flex items-center gap-2">
              <img src="/logos/salesforce.svg" alt="Salesforce" className="h-6 w-6" />
              <span className="font-medium text-gray-900">Salesforce</span>
            </div>
          </label>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={formData.hubspotEnabled}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  hubspotEnabled: e.target.checked,
                })
              }
              className="h-5 w-5 rounded text-blue-600"
            />
            <div className="flex items-center gap-2">
              <img src="/logos/hubspot.svg" alt="HubSpot" className="h-6 w-6" />
              <span className="font-medium text-gray-900">HubSpot</span>
            </div>
          </label>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={formData.pipedriveEnabled}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  pipedriveEnabled: e.target.checked,
                })
              }
              className="h-5 w-5 rounded text-blue-600"
            />
            <div className="flex items-center gap-2">
              <img src="/logos/pipedrive.svg" alt="Pipedrive" className="h-6 w-6" />
              <span className="font-medium text-gray-900">Pipedrive</span>
            </div>
          </label>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={formData.rdstationEnabled}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  rdstationEnabled: e.target.checked,
                })
              }
              className="h-5 w-5 rounded text-blue-600"
            />
            <div className="flex items-center gap-2">
              <img src="/logos/rdstation.svg" alt="RD Station" className="h-6 w-6" />
              <span className="font-medium text-gray-900">RD Station</span>
            </div>
          </label>
        </div>
      </div>

      {/* Eventos que Disparam Sincronização */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Quando Sincronizar Automaticamente?
        </h2>

        <div className="space-y-3">
          <label className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-50 p-3">
            <div>
              <span className="font-medium text-gray-900">Lead Criado</span>
              <p className="text-sm text-gray-600">
                Sincronizar assim que um novo lead for capturado via WhatsApp
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.syncOnLeadCreated}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  syncOnLeadCreated: e.target.checked,
                })
              }
              className="h-5 w-5 rounded text-blue-600"
            />
          </label>

          <label className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-50 p-3">
            <div>
              <span className="font-medium text-gray-900">Lead Qualificado</span>
              <p className="text-sm text-gray-600">
                Sincronizar após o bot qualificar e pontuar o lead
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.syncOnLeadQualified}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  syncOnLeadQualified: e.target.checked,
                })
              }
              className="h-5 w-5 rounded text-blue-600"
            />
          </label>

          <label className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-50 p-3">
            <div>
              <span className="font-medium text-gray-900">Lead Convertido</span>
              <p className="text-sm text-gray-600">Sincronizar quando o lead se tornar cliente</p>
            </div>
            <input
              type="checkbox"
              checked={formData.syncOnLeadConverted}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  syncOnLeadConverted: e.target.checked,
                })
              }
              className="h-5 w-5 rounded text-blue-600"
            />
          </label>

          <label className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-50 p-3">
            <div>
              <span className="font-medium text-gray-900">Contato Atualizado</span>
              <p className="text-sm text-gray-600">
                Sincronizar quando dados do contato forem alterados
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.syncOnContactUpdated}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  syncOnContactUpdated: e.target.checked,
                })
              }
              className="h-5 w-5 rounded text-blue-600"
            />
          </label>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Filtros de Sincronização</h2>

        <div className="space-y-4">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={formData.syncOnlyHighQualityLeads}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  syncOnlyHighQualityLeads: e.target.checked,
                })
              }
              className="h-5 w-5 rounded text-blue-600"
            />
            <div>
              <span className="font-medium text-gray-900">
                Sincronizar apenas leads de alta qualidade
              </span>
              <p className="text-sm text-gray-600">Leads com score &gt;= 70 pontos</p>
            </div>
          </label>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              Tipos de Caso para Sincronizar
            </label>
            <select
              multiple
              value={formData.caseTypesToSync || []}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                setFormData({ ...formData, caseTypesToSync: selected });
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
            >
              <option value="">Todos</option>
              <option value="Trabalhista">Trabalhista</option>
              <option value="Civil">Civil</option>
              <option value="Criminal">Criminal</option>
              <option value="Família">Família</option>
              <option value="Consumidor">Consumidor</option>
              <option value="Previdenciário">Previdenciário</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Deixe vazio para sincronizar todos os tipos
            </p>
          </div>
        </div>
      </div>

      {/* Retry Configuration */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Configurações de Retry</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              Máximo de Tentativas
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.maxRetryAttempts || 3}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maxRetryAttempts: parseInt(e.target.value),
                })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              Intervalo entre Tentativas (minutos)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={formData.retryDelayMinutes || 5}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  retryDelayMinutes: parseInt(e.target.value),
                })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black"
            />
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={updateSettings.isPending}
          className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {updateSettings.isPending ? 'Salvando...' : 'Salvar Configurações'}
        </button>

        <button
          onClick={() => settings && setFormData(settings)}
          className="rounded-lg bg-gray-200 px-6 py-3 text-gray-700 hover:bg-gray-300"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
