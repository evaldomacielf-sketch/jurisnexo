'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface Tenant {
    id: string;
    name: string;
    slug: string;
}

export default function TenantSelectPage() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetch('http://localhost:4001/api/tenants/me', { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setTenants(data);
                } else if (data.data && Array.isArray(data.data)) {
                    setTenants(data.data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const selectTenant = async (tenantId: string) => {
        try {
            const res = await fetch('http://localhost:4001/api/tenants/me/active-tenant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tenantId }),
                credentials: 'include',
            });
            if (res.ok) {
                const data = await res.json();
                if (data.token) {
                    document.cookie = `access_token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
                }
                router.push('/dashboard');
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-[#f6f6f8] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#1152d4]" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#f6f6f8] dark:bg-[#101622] items-stretch overflow-hidden font-display">
            {/* Left Side: Form Area */}
            <div className="flex-1 flex flex-col justify-center items-center px-8 lg:px-20 bg-[#f6f6f8] text-[#0A0E27] !text-[#0A0E27] relative overflow-hidden">
                {/* Watermark Background */}
                <div className="absolute inset-0 z-0 bg-center bg-no-repeat bg-cover opacity-10 pointer-events-none bg-[url('/images/jurisnexo-watermark.png')]"></div>

                <div className="w-full max-w-[440px] flex flex-col relative z-10">
                    {/* Logo & Brand */}
                    <div className="flex flex-col items-center gap-6 mb-12 text-center">
                        <div className="w-72 h-auto shrink-0">
                            <img
                                src="/images/jurisnexo-v2.png"
                                alt="JurisNexo Premium"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <h2 className="text-[#0A0E27] text-2xl font-bold leading-tight tracking-tight font-display">Crm Juridico + Whatsapp</h2>
                    </div>

                    <div className="mb-8">
                        <h1 className="!text-[#0A0E27] text-[#0A0E27] tracking-tight text-[32px] font-bold leading-tight mb-2 font-display">Selecione seu Escritório</h1>
                        <p className="text-[#4f5b76] text-base font-normal leading-normal font-display">Escolha o ambiente de trabalho para continuar.</p>
                    </div>

                    <div className="space-y-4 w-full">
                        {tenants.map(t => (
                            <button
                                key={t.id}
                                onClick={() => selectTenant(t.id)}
                                className="w-full text-left p-4 rounded-xl bg-white border border-slate-200 hover:border-[#1152d4] hover:shadow-md transition-all flex justify-between items-center group"
                            >
                                <span className="font-bold text-[#0A0E27] text-lg font-display">{t.name}</span>
                                <span className="text-[#9da6b9] group-hover:text-[#1152d4] material-symbols-outlined">arrow_forward</span>
                            </button>
                        ))}

                        {/* Create Tenant Option - Primary Action if list is empty, secondary otherwise */}
                        <button
                            onClick={() => router.push('/tenants/create')}
                            className={`w-full flex items-center justify-center gap-2 font-bold font-display py-4 rounded-xl transition-all ${tenants.length === 0
                                ? 'bg-[#1152d4] text-white hover:bg-[#0e44b1] shadow-lg hover:shadow-xl'
                                : 'bg-white border-2 border-dashed border-slate-300 text-[#4f5b76] hover:border-[#1152d4] hover:text-[#1152d4]'
                                }`}
                        >
                            <span className="material-symbols-outlined">add_circle</span>
                            {tenants.length === 0 ? 'Criar meu Primeiro Escritório' : 'Criar Novo Escritório'}
                        </button>
                    </div>

                    {/* Footer Small Print */}
                    <div className="mt-16 flex items-center justify-center gap-2 text-[#4f5b76]">
                        <span className="material-symbols-outlined text-sm">lock</span>
                        <span className="text-xs font-display">Ambiente seguro JurisNexo SSL 256-bit</span>
                    </div>
                </div>
            </div>

            {/* Right Side: Abstract Illustration */}
            <div className="hidden lg:flex flex-1 relative bg-[#0A0E27] items-center justify-center overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-50 mix-blend-normal bg-[url('/images/law_office_tech.png')]"></div>

                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 z-1 bg-gradient-to-t from-[#0A0E27] via-[#0A0E27]/40 to-transparent"></div>

                {/* Abstract Tech Elements */}
                <div className="absolute inset-0 opacity-30 pointer-events-none z-2">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[120px] mix-blend-color-dodge"></div>
                </div>

                <div className="relative z-10 p-12 w-full h-full flex flex-col justify-between max-w-[600px]">
                    {/* Top Section: Main Card */}
                    <div className="flex justify-center mt-0 pt-8">
                        <div className="relative group w-full">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-[#D4AF37] rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                            <div className="relative bg-[#1c2230]/60 backdrop-blur-xl border border-[#3b4354] rounded-2xl px-8 py-5 shadow-2xl text-center">
                                <span className="material-symbols-outlined text-blue-500 text-7xl mb-2 bg-clip-text text-transparent bg-gradient-to-br from-blue-400 to-[#D4AF37]">apartment</span>
                                <h3 className="text-white text-2xl font-bold mb-2 font-display">Gestão Multi-Escritório</h3>
                                <p className="text-[#9da6b9] leading-relaxed font-display">Gerencie múltiplas bancas ou filiais com facilidade, alternando entre ambientes com um único clique.</p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section: Feature Cards */}
                    <div className="grid grid-cols-2 gap-4 mb-12">
                        <div className="flex flex-col items-center bg-[#0f1219]/70 backdrop-blur-md p-6 rounded-xl border border-white/5 hover:border-blue-500/30 transition-colors shadow-lg">
                            <span className="material-symbols-outlined text-blue-500 mb-2 text-3xl">domain</span>
                            <span className="text-white text-base font-medium font-display">Múltiplos CNPJs</span>
                        </div>
                        <div className="flex flex-col items-center bg-[#0f1219]/70 backdrop-blur-md p-6 rounded-xl border border-white/5 hover:border-[#D4AF37]/30 transition-colors shadow-lg">
                            <span className="material-symbols-outlined text-[#D4AF37] mb-2 text-3xl">group_add</span>
                            <span className="text-white text-base font-medium font-display">Equipes Dedicadas</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
