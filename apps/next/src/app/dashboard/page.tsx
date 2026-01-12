import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decode } from 'jsonwebtoken';

export default function DashboardPage() {
    const cookieStore = cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
        redirect('/auth/login');
    }

    // Decode token (insecure parse, just for claims check)
    // Verify should ideally happen in middleware.
    const payload: any = decode(token);

    if (!payload || !payload.tenant_id) {
        // No tenant context
        redirect('/tenants/select');
    }

    return (
        <div className="flex flex-1 h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto p-8">
                <div className="flex gap-6 h-full min-h-[600px] pb-8">
                    {/* Column 1: Leads */}
                    <div className="kanban-column flex flex-col gap-4 flex-1">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wider">Leads</h4>
                                <span className="bg-gray-200 dark:bg-gray-700 text-xs px-2 py-0.5 rounded-full font-bold text-gray-700">4</span>
                            </div>
                            <button className="text-[#616f89] hover:text-blue-600"><span className="material-symbols-outlined text-xl">add</span></button>
                        </div>
                        <div className="flex-1 bg-[#f0f2f4]/50 dark:bg-gray-800/20 rounded-xl p-3 space-y-3 overflow-y-auto">
                            <div className="bg-white dark:bg-[#1a2130] p-4 rounded-lg border border-[#dbdfe6] dark:border-[#2d3748] shadow-sm hover:border-blue-600 transition-colors cursor-grab pointer-events-auto">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] uppercase tracking-wider font-bold text-blue-600 bg-blue-600/10 px-2 py-0.5 rounded">Danos Morais</span>
                                    <span className="material-symbols-outlined text-gray-400 text-lg">more_horiz</span>
                                </div>
                                <h5 className="text-sm font-bold text-gray-900 dark:text-gray-100">João Pereira</h5>
                                <p className="text-xs text-[#616f89] mt-1 line-clamp-2">Consulta solicitada sobre acidente de trânsito em via urbana.</p>
                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex -space-x-2">
                                        <div className="size-6 rounded-full border-2 border-white dark:border-[#1a2130] bg-gray-200"></div>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-[#616f89]">
                                        <span className="material-symbols-outlined text-sm">schedule</span>
                                        2h atrás
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-[#1a2130] p-4 rounded-lg border border-[#dbdfe6] dark:border-[#2d3748] shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] uppercase tracking-wider font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded">Família</span>
                                </div>
                                <h5 className="text-sm font-bold text-gray-900 dark:text-gray-100">Emília Costa</h5>
                                <p className="text-xs text-[#616f89] mt-1">Dúvidas sobre mediação de divórcio consensual.</p>
                                <div className="flex items-center justify-between mt-4">
                                    <div className="size-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600">EC</div>
                                    <div className="flex items-center gap-1 text-[10px] text-red-500 font-bold uppercase tracking-tighter">
                                        <span className="material-symbols-outlined text-sm">priority_high</span>
                                        Urgente
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Triagem */}
                    <div className="kanban-column flex flex-col gap-4 flex-1">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wider">Triagem</h4>
                                <span className="bg-gray-200 dark:bg-gray-700 text-xs px-2 py-0.5 rounded-full font-bold text-gray-700">2</span>
                            </div>
                        </div>
                        <div className="flex-1 bg-[#f0f2f4]/50 dark:bg-gray-800/20 rounded-xl p-3 space-y-3 overflow-y-auto">
                            <div className="bg-white dark:bg-[#1a2130] p-4 rounded-lg border border-[#dbdfe6] dark:border-[#2d3748] shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] uppercase tracking-wider font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded">Imobiliário</span>
                                </div>
                                <h5 className="text-sm font-bold text-gray-900 dark:text-gray-100">Sara Santos</h5>
                                <p className="text-xs text-[#616f89] mt-1">Revisão de contrato de compra e venda.</p>
                                <div className="flex items-center justify-between mt-4">
                                    <div className="size-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600">SS</div>
                                    <div className="flex items-center gap-1 text-[10px] text-[#616f89]">
                                        <span className="material-symbols-outlined text-sm">event</span>
                                        Amanhã
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column 3: Contrato */}
                    <div className="kanban-column flex flex-col gap-4 flex-1">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wider">Contrato</h4>
                                <span className="bg-gray-200 dark:bg-gray-700 text-xs px-2 py-0.5 rounded-full font-bold text-gray-700">3</span>
                            </div>
                        </div>
                        <div className="flex-1 bg-[#f0f2f4]/50 dark:bg-gray-800/20 rounded-xl p-3 space-y-3 overflow-y-auto">
                            <div className="bg-white dark:bg-[#1a2130] p-4 rounded-lg border border-[#dbdfe6] dark:border-[#2d3748] shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] uppercase tracking-wider font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded">Corporativo</span>
                                </div>
                                <h5 className="text-sm font-bold text-gray-900 dark:text-gray-100">Tecno S.A.</h5>
                                <p className="text-xs text-[#616f89] mt-1">Minuta de acordo de acionistas em revisão.</p>
                                <div className="flex items-center justify-between mt-4">
                                    <div className="size-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-gray-600">TS</div>
                                    <div className="flex items-center gap-1 text-[10px] text-orange-600 font-bold uppercase tracking-tight">
                                        <span className="material-symbols-outlined text-sm">history_edu</span>
                                        Revisão
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column 4: Ativo */}
                    <div className="kanban-column flex flex-col gap-4 flex-1">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wider">Ativo</h4>
                                <span className="bg-gray-200 dark:bg-gray-700 text-xs px-2 py-0.5 rounded-full font-bold text-gray-700">8</span>
                            </div>
                        </div>
                        <div className="flex-1 bg-[#f0f2f4]/50 dark:bg-gray-800/20 rounded-xl p-3 space-y-3 overflow-y-auto">
                            <div className="bg-white dark:bg-[#1a2130] p-4 rounded-lg border border-[#dbdfe6] dark:border-[#2d3748] shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] uppercase tracking-wider font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">Contencioso</span>
                                </div>
                                <h5 className="text-sm font-bold text-gray-900 dark:text-gray-100">Miguel Soares</h5>
                                <p className="text-xs text-[#616f89] mt-1">Preparação para audiência de instrução.</p>
                                <div className="flex items-center justify-between mt-4">
                                    <div className="size-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600">MS</div>
                                    <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold uppercase">
                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                        Atualizado
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Sidebar */}
            <aside className="w-80 bg-white dark:bg-[#1a2130] border-l border-[#dbdfe6] dark:border-[#2d3748] flex flex-col shrink-0">
                <div className="p-6 border-b border-[#dbdfe6] dark:border-[#2d3748] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <svg className="size-5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path>
                        </svg>
                        <h4 class="font-bold text-sm text-gray-900 dark:text-gray-100">WhatsApp</h4>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="size-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] text-[#616f89] font-bold uppercase tracking-widest">Ativo</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="p-6 border-b border-[#f0f2f4] dark:border-[#2d3748]">
                        <h5 className="text-xs font-bold text-[#616f89] uppercase tracking-wider mb-4">Convites Pendentes</h5>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-[#dbdfe6] dark:border-[#2d3748]">
                                <div className="flex items-center gap-2">
                                    <div className="size-8 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600 text-xs font-bold">FA</div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold truncate text-gray-900 dark:text-gray-100">Fernanda Almeida</p>
                                        <p className="text-[10px] text-[#616f89]">Enviado há 2h</p>
                                    </div>
                                </div>
                                <button className="text-[#616f89] hover:text-red-500"><span className="material-symbols-outlined text-lg">close</span></button>
                            </div>
                        </div>
                    </div>

                    {/* Messages... simplified for length */}
                    <div className="p-4 bg-blue-600/5 border-b border-[#f0f2f4] dark:border-[#2d3748]">
                        <div className="flex gap-3">
                            <div className="shrink-0 size-11 rounded-full bg-gray-200"></div>
                            <div className="flex-1 min-w-0">
                                <h5 className="text-sm font-bold truncate text-gray-900 dark:text-gray-100">João Pereira</h5>
                                <p className="text-xs text-[#111318] dark:text-gray-300">Você já revisou o contrato?</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
}
