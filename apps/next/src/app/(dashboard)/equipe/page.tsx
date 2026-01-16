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
                fetch('http://localhost:4000/api/tenants/me/members', { credentials: 'include' }),
                fetch('http://localhost:4000/api/tenants/me/invites', { credentials: 'include' })
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
            const res = await fetch('http://localhost:4000/api/tenants/me/invites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
                credentials: 'include'
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
            await fetch(`http://localhost:4000/api/tenants/me/invites/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            fetchData();
        } catch (e) {
            alert('Erro ao revogar');
        }
    };

    return (
        <div className="flex-1 overflow-y-auto px-8 py-8 font-display bg-[#f6f6f8] dark:bg-[#101622]">
            {/* Page Heading */}
            <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl font-black tracking-tight text-[#111318] dark:text-white">Gestão de Equipe</h2>
                    <p className="text-[#616f89] dark:text-gray-400">Gerencie os membros da sua organização e seus níveis de permissão.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-blue-700 text-white font-bold rounded-lg transition-all shadow-md active:scale-95"
                >
                    <span className="material-symbols-outlined text-xl">person_add</span>
                    <span>Convidar Membro</span>
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-[#dbdfe6] dark:border-gray-800 mb-6 font-display">
                <div className="flex gap-8">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`pb-3 px-1 text-sm font-bold transition-all border-b-2 ${activeTab === 'active' ? 'border-primary text-primary' : 'border-transparent text-[#616f89] hover:text-[#111318] dark:hover:text-white'
                            }`}
                    >
                        Membros Ativos ({members.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`pb-3 px-1 text-sm font-bold transition-all border-b-2 ${activeTab === 'pending' ? 'border-primary text-primary' : 'border-transparent text-[#616f89] hover:text-[#111318] dark:hover:text-white'
                            }`}
                    >
                        Convites Pendentes ({invites.filter(i => i.status === 'pending').length})
                    </button>
                    <button
                        onClick={() => setActiveTab('inactive')}
                        className={`pb-3 px-1 text-sm font-bold transition-all border-b-2 ${activeTab === 'inactive' ? 'border-primary text-primary' : 'border-transparent text-[#616f89] hover:text-[#111318] dark:hover:text-white'
                            }`}
                    >
                        Inativos
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#1c222d] border border-[#dbdfe6] dark:border-gray-800 rounded-xl overflow-hidden mb-8 shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-[#1a202a] text-[#111318] dark:text-gray-300 text-xs font-semibold uppercase tracking-wider">
                            <th className="px-6 py-4">Nome</th>
                            <th className="px-6 py-4">E-mail</th>
                            <th className="px-6 py-4">Cargo</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#dbdfe6] dark:divide-gray-800">
                        {activeTab === 'active' && members.map(m => (
                            <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary font-bold text-sm">
                                            {m.user?.full_name?.substring(0, 2).toUpperCase() || 'U'}
                                        </div>
                                        <span className="font-semibold text-[#111318] dark:text-white">{m.user?.full_name || 'Usuário'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-[#616f89] dark:text-gray-400">{m.user?.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${m.role === 'admin' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                                        m.role === 'owner' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                                            'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                        }`}>
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
                                    <button className="text-[#616f89] hover:text-primary transition-colors">
                                        <span className="material-symbols-outlined">edit</span>
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {activeTab === 'pending' && invites.filter(i => i.status === 'pending').map(invite => (
                            <tr key={invite.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 font-bold text-sm">
                                            {invite.email.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className="font-semibold text-[#111318] dark:text-white">{invite.email.split('@')[0]}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-[#616f89] dark:text-gray-400">{invite.email}</td>
                                <td className="px-6 py-4">
                                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-full uppercase">
                                        {invite.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                                        <span className="size-2 rounded-full bg-amber-500 animate-pulse"></span>
                                        <span className="text-sm font-medium">Pendente</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-3">
                                        <button className="text-primary hover:underline text-xs font-bold">Reenviar</button>
                                        <button onClick={() => handleRevoke(invite.id)} className="text-[#616f89] hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {((activeTab === 'active' && members.length === 0) || (activeTab === 'pending' && invites.filter(i => i.status === 'pending').length === 0)) && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-[#616f89] font-medium">
                                    Nenhum registro encontrado.
                                </td>
                            </tr>
                        )}
                        {activeTab === 'inactive' && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-[#616f89] font-medium">
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
                <div className="bg-white dark:bg-[#1c222d] border border-[#dbdfe6] dark:border-gray-800 rounded-xl p-6">
                    <div className="flex flex-col gap-6">
                        {/* Static Log Items for Design (Replace with real data later if available) */}
                        <div className="flex gap-4 relative">
                            <div className="absolute left-2.5 top-6 bottom-[-24px] w-[1px] bg-gray-200 dark:bg-gray-700"></div>
                            <div className="size-5 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center z-10 border-2 border-white dark:border-[#1c222d]">
                                <div className="size-1.5 rounded-full bg-primary"></div>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm leading-none dark:text-gray-200"><span className="font-bold">Administrador</span> enviou um convite para um novo membro.</p>
                                <span className="text-[11px] text-[#616f89] uppercase tracking-tighter">Hoje às 14:32</span>
                            </div>
                        </div>
                        <div className="flex gap-4 relative">
                            <div className="absolute left-2.5 top-6 bottom-[-24px] w-[1px] bg-gray-200 dark:bg-gray-700"></div>
                            <div className="size-5 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center z-10 border-2 border-white dark:border-[#1c222d]">
                                <div className="size-1.5 rounded-full bg-emerald-500"></div>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm leading-none dark:text-gray-200"><span className="font-bold">Sistema</span> atualizou as permissões de acesso.</p>
                                <span className="text-[11px] text-[#616f89] uppercase tracking-tighter">Ontem às 09:15</span>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="size-5 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center z-10 border-2 border-white dark:border-[#1c222d]">
                                <div className="size-1.5 rounded-full bg-purple-500"></div>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm leading-none dark:text-gray-200"><span className="font-bold">João Silva</span> foi promovido a Administrador.</p>
                                <span className="text-[11px] text-[#616f89] uppercase tracking-tighter">15 Out, 2023 às 16:40</span>
                            </div>
                        </div>
                    </div>
                    <button className="mt-6 text-sm text-primary font-bold hover:underline transition-all">Ver log completo</button>
                </div>
            </div>

            {/* Redesigned Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#1c222d] w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-[#dbdfe6] dark:border-gray-700 transform transition-all scale-100">
                        <div className="p-6 border-b border-[#dbdfe6] dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-[#111318] dark:text-white">Convidar novo membro</h3>
                            <button onClick={() => setShowModal(false)} className="text-[#616f89] hover:text-primary transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleInvite}>
                            <div className="p-6 flex flex-col gap-5">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-[#111318] dark:text-gray-300">E-mail do convidado</label>
                                    <input
                                        required
                                        type="email"
                                        value={inviteEmail}
                                        onChange={e => setInviteEmail(e.target.value)}
                                        className="w-full h-11 px-4 rounded-lg border border-[#dbdfe6] dark:border-gray-600 bg-white dark:bg-[#101622] text-[#111318] dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                                        placeholder="exemplo@adv.com.br"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-[#111318] dark:text-gray-300">Nível de acesso</label>
                                    <select
                                        aria-label="Selecionar nível de acesso"
                                        value={inviteRole}
                                        onChange={e => setInviteRole(e.target.value)}
                                        className="w-full h-11 px-4 rounded-lg border border-[#dbdfe6] dark:border-gray-600 bg-white dark:bg-[#101622] text-[#111318] dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                    >
                                        <option value="member">Relator / Membro</option>
                                        <option value="admin">Administrador</option>
                                        <option value="owner">Sócio (Owner)</option>
                                    </select>
                                </div>
                                <p className="text-xs text-[#616f89] leading-tight">O convidado receberá um e-mail com instruções para criar sua senha e acessar a plataforma.</p>
                            </div>
                            <div className="p-6 bg-gray-50 dark:bg-[#1a202a] flex justify-end gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-bold text-[#111318] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">Cancelar</button>
                                <button type="submit" className="px-6 py-2 text-sm font-bold white text-white bg-primary hover:bg-blue-700 rounded-lg transition-all shadow-md active:scale-95">Enviar Convite</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
