'use client';

import { useState, useEffect } from 'react';

interface Member {
  id: string;
  role: string;
  user: {
    full_name: string;
    email: string;
    avatar_url: string;
  } | null;
}

interface Invite {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'inactive'>('active');

  // Form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [memRes, invRes] = await Promise.all([
        fetch('http://localhost:5000/api/tenants/me/members', { credentials: 'include' }),
        fetch('http://localhost:5000/api/tenants/me/invites', { credentials: 'include' }),
      ]);

      if (memRes.ok) setMembers(await memRes.json());
      if (invRes.ok) setInvites(await invRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/tenants/me/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
        credentials: 'include',
      });
      if (res.ok) {
        setShowModal(false);
        setInviteEmail('');
        fetchData(); // refresh
      } else {
        alert('Falha ao enviar convite');
      }
    } catch (e) {
      alert('Erro ao processar');
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Revogar convite?')) return;
    try {
      await fetch(`http://localhost:5000/api/tenants/me/invites/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      fetchData();
    } catch (e) {
      alert('Erro ao revogar');
    }
  };

  return (
    <div className="font-display flex-1 overflow-y-auto bg-[#f6f6f8] px-8 py-8 dark:bg-[#101622]">
      {/* Page Heading */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-black tracking-tight text-[#111318] dark:text-white">
            Gestão de Equipe
          </h2>
          <p className="text-[#616f89] dark:text-gray-400">
            Gerencie os membros da sua organização e seus níveis de permissão.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-bold text-white shadow-md transition-all hover:bg-blue-700 active:scale-95"
        >
          <span className="material-symbols-outlined text-xl">person_add</span>
          <span>Convidar Membro</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="font-display mb-6 border-b border-[#dbdfe6] dark:border-gray-800">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('active')}
            className={`border-b-2 px-1 pb-3 text-sm font-bold transition-all ${activeTab === 'active'
                ? 'border-primary text-primary'
                : 'border-transparent text-[#616f89] hover:text-[#111318] dark:hover:text-white'
              }`}
          >
            Membros Ativos ({members.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`border-b-2 px-1 pb-3 text-sm font-bold transition-all ${activeTab === 'pending'
                ? 'border-primary text-primary'
                : 'border-transparent text-[#616f89] hover:text-[#111318] dark:hover:text-white'
              }`}
          >
            Convites Pendentes ({invites.filter((i) => i.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('inactive')}
            className={`border-b-2 px-1 pb-3 text-sm font-bold transition-all ${activeTab === 'inactive'
                ? 'border-primary text-primary'
                : 'border-transparent text-[#616f89] hover:text-[#111318] dark:hover:text-white'
              }`}
          >
            Inativos
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mb-8 overflow-hidden rounded-xl border border-[#dbdfe6] bg-white shadow-sm dark:border-gray-800 dark:bg-[#1c222d]">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-[#111318] dark:bg-[#1a202a] dark:text-gray-300">
              <th className="px-6 py-4">Nome</th>
              <th className="px-6 py-4">E-mail</th>
              <th className="px-6 py-4">Cargo</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#dbdfe6] dark:divide-gray-800">
            {activeTab === 'active' &&
              members.map((m) => (
                <tr
                  key={m.id}
                  className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-primary dark:bg-blue-900/30">
                        {m.user?.full_name?.substring(0, 2).toUpperCase() || 'U'}
                      </div>
                      <span className="font-semibold text-[#111318] dark:text-white">
                        {m.user?.full_name || 'Usuário'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#616f89] dark:text-gray-400">
                    {m.user?.email}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${m.role === 'admin'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : m.role === 'owner'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}
                    >
                      {m.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <span className="size-2 rounded-full bg-emerald-500"></span>
                      <span className="text-sm font-medium">Ativo</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-[#616f89] transition-colors hover:text-primary">
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                  </td>
                </tr>
              ))}

            {activeTab === 'pending' &&
              invites
                .filter((i) => i.status === 'pending')
                .map((invite) => (
                  <tr
                    key={invite.id}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-600 dark:bg-amber-900/30">
                          {invite.email.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-[#111318] dark:text-white">
                          {invite.email.split('@')[0]}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#616f89] dark:text-gray-400">
                      {invite.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                        {invite.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                        <span className="size-2 animate-pulse rounded-full bg-amber-500"></span>
                        <span className="text-sm font-medium">Pendente</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button className="text-xs font-bold text-primary hover:underline">
                          Reenviar
                        </button>
                        <button
                          onClick={() => handleRevoke(invite.id)}
                          className="text-[#616f89] transition-colors hover:text-primary"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

            {((activeTab === 'active' && members.length === 0) ||
              (activeTab === 'pending' &&
                invites.filter((i) => i.status === 'pending').length === 0)) && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center font-medium text-[#616f89]">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              )}
            {activeTab === 'inactive' && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center font-medium text-[#616f89]">
                  Área para gerenciamento de membros inativos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Audit Log Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-[#111318] dark:text-white">
          <span className="material-symbols-outlined text-lg">history</span>
          <h3 className="text-base font-bold">Histórico de Auditoria</h3>
        </div>
        <div className="rounded-xl border border-[#dbdfe6] bg-white p-6 dark:border-gray-800 dark:bg-[#1c222d]">
          <div className="flex flex-col gap-6">
            {/* Static Log Items for Design (Replace with real data later if available) */}
            <div className="relative flex gap-4">
              <div className="absolute bottom-[-24px] left-2.5 top-6 w-[1px] bg-gray-200 dark:bg-gray-700"></div>
              <div className="z-10 flex size-5 items-center justify-center rounded-full border-2 border-white bg-blue-100 dark:border-[#1c222d] dark:bg-blue-900">
                <div className="size-1.5 rounded-full bg-primary"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm leading-none dark:text-gray-200">
                  <span className="font-bold">Administrador</span> enviou um convite para um novo
                  membro.
                </p>
                <span className="text-[11px] uppercase tracking-tighter text-[#616f89]">
                  Hoje às 14:32
                </span>
              </div>
            </div>
            <div className="relative flex gap-4">
              <div className="absolute bottom-[-24px] left-2.5 top-6 w-[1px] bg-gray-200 dark:bg-gray-700"></div>
              <div className="z-10 flex size-5 items-center justify-center rounded-full border-2 border-white bg-emerald-100 dark:border-[#1c222d] dark:bg-emerald-900">
                <div className="size-1.5 rounded-full bg-emerald-500"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm leading-none dark:text-gray-200">
                  <span className="font-bold">Sistema</span> atualizou as permissões de acesso.
                </p>
                <span className="text-[11px] uppercase tracking-tighter text-[#616f89]">
                  Ontem às 09:15
                </span>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="z-10 flex size-5 items-center justify-center rounded-full border-2 border-white bg-purple-100 dark:border-[#1c222d] dark:bg-purple-900">
                <div className="size-1.5 rounded-full bg-purple-500"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm leading-none dark:text-gray-200">
                  <span className="font-bold">João Silva</span> foi promovido a Administrador.
                </p>
                <span className="text-[11px] uppercase tracking-tighter text-[#616f89]">
                  15 Out, 2023 às 16:40
                </span>
              </div>
            </div>
          </div>
          <button className="mt-6 text-sm font-bold text-primary transition-all hover:underline">
            Ver log completo
          </button>
        </div>
      </div>

      {/* Redesigned Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md scale-100 transform overflow-hidden rounded-xl border border-[#dbdfe6] bg-white shadow-2xl transition-all dark:border-gray-700 dark:bg-[#1c222d]">
            <div className="flex items-center justify-between border-b border-[#dbdfe6] p-6 dark:border-gray-700">
              <h3 className="text-xl font-bold text-[#111318] dark:text-white">
                Convidar novo membro
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#616f89] transition-colors hover:text-primary"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleInvite}>
              <div className="flex flex-col gap-5 p-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#111318] dark:text-gray-300">
                    E-mail do convidado
                  </label>
                  <input
                    required
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="h-11 w-full rounded-lg border border-[#dbdfe6] bg-white px-4 text-[#111318] outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-[#101622] dark:text-white"
                    placeholder="exemplo@adv.com.br"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#111318] dark:text-gray-300">
                    Nível de acesso
                  </label>
                  <select
                    aria-label="Selecionar nível de acesso"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="h-11 w-full rounded-lg border border-[#dbdfe6] bg-white px-4 text-[#111318] outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-[#101622] dark:text-white"
                  >
                    <option value="member">Relator / Membro</option>
                    <option value="admin">Administrador</option>
                    <option value="owner">Sócio (Owner)</option>
                  </select>
                </div>
                <p className="text-xs leading-tight text-[#616f89]">
                  O convidado receberá um e-mail com instruções para criar sua senha e acessar a
                  plataforma.
                </p>
              </div>
              <div className="flex justify-end gap-3 bg-gray-50 p-6 dark:bg-[#1a202a]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg px-4 py-2 text-sm font-bold text-[#111318] transition-colors hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="white rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-700 active:scale-95"
                >
                  Enviar Convite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
