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
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/tenants/me`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTenants(data);
        } else if (data.data && Array.isArray(data.data)) {
          setTenants(data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const selectTenant = async (tenantId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/tenants/me/active-tenant`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tenantId }),
          credentials: 'include',
        }
      );
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
      <div className="flex min-h-screen items-center justify-center bg-[#f6f6f8]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1152d4]" />
      </div>
    );
  }

  return (
    <div className="font-display flex min-h-screen items-stretch overflow-hidden bg-[#f6f6f8] dark:bg-[#101622]">
      {/* Left Side: Form Area */}
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-[#f6f6f8] px-8 !text-[#0A0E27] text-[#0A0E27] lg:px-20">
        {/* Watermark Background */}
        <div className="pointer-events-none absolute inset-0 z-0 bg-[url('/images/jurisnexo-watermark.png')] bg-cover bg-center bg-no-repeat opacity-10"></div>

        <div className="relative z-10 flex w-full max-w-[440px] flex-col">
          {/* Logo & Brand */}
          <div className="mb-12 flex flex-col items-center gap-6 text-center">
            <div className="h-auto w-72 shrink-0">
              <img
                src="/images/jurisnexo-v2.png"
                alt="JurisNexo Premium"
                className="h-full w-full object-contain"
              />
            </div>
            <h2 className="font-display text-2xl font-bold leading-tight tracking-tight text-[#0A0E27]">
              Crm Juridico + Whatsapp
            </h2>
          </div>

          <div className="mb-8">
            <h1 className="font-display mb-2 text-[32px] font-bold leading-tight tracking-tight !text-[#0A0E27] text-[#0A0E27]">
              Selecione seu Escritório
            </h1>
            <p className="font-display text-base font-normal leading-normal text-[#4f5b76]">
              Escolha o ambiente de trabalho para continuar.
            </p>
          </div>

          <div className="w-full space-y-4">
            {tenants.map((t) => (
              <button
                key={t.id}
                onClick={() => selectTenant(t.id)}
                className="group flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-[#1152d4] hover:shadow-md"
              >
                <span className="font-display text-lg font-bold text-[#0A0E27]">{t.name}</span>
                <span className="material-symbols-outlined text-[#9da6b9] group-hover:text-[#1152d4]">
                  arrow_forward
                </span>
              </button>
            ))}

            {/* Create Tenant Option - Primary Action if list is empty, secondary otherwise */}
            <button
              onClick={() => router.push('/tenants/create')}
              className={`font-display flex w-full items-center justify-center gap-2 rounded-xl py-4 font-bold transition-all ${
                tenants.length === 0
                  ? 'bg-[#1152d4] text-white shadow-lg hover:bg-[#0e44b1] hover:shadow-xl'
                  : 'border-2 border-dashed border-slate-300 bg-white text-[#4f5b76] hover:border-[#1152d4] hover:text-[#1152d4]'
              }`}
            >
              <span className="material-symbols-outlined">add_circle</span>
              {tenants.length === 0 ? 'Criar meu Primeiro Escritório' : 'Criar Novo Escritório'}
            </button>
          </div>

          {/* Footer Small Print */}
          <div className="mt-16 flex items-center justify-center gap-2 text-[#4f5b76]">
            <span className="material-symbols-outlined text-sm">lock</span>
            <span className="font-display text-xs">Ambiente seguro JurisNexo SSL 256-bit</span>
          </div>
        </div>
      </div>

      {/* Right Side: Abstract Illustration */}
      <div className="relative hidden flex-1 items-center justify-center overflow-hidden bg-[#0A0E27] lg:flex">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 bg-[url('/images/law_office_tech.png')] bg-cover bg-center bg-no-repeat opacity-50 mix-blend-normal"></div>

        {/* Gradient Overlay for Text Readability */}
        <div className="z-1 absolute inset-0 bg-gradient-to-t from-[#0A0E27] via-[#0A0E27]/40 to-transparent"></div>

        {/* Abstract Tech Elements */}
        <div className="z-2 pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-blue-600 mix-blend-color-dodge blur-[120px]"></div>
        </div>

        <div className="relative z-10 flex h-full w-full max-w-[600px] flex-col justify-between p-12">
          {/* Top Section: Main Card */}
          <div className="mt-0 flex justify-center pt-8">
            <div className="group relative w-full">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600 to-[#D4AF37] opacity-25 blur transition duration-1000 group-hover:opacity-50"></div>
              <div className="relative rounded-2xl border border-[#3b4354] bg-[#1c2230]/60 px-8 py-5 text-center shadow-2xl backdrop-blur-xl">
                <span className="material-symbols-outlined mb-2 bg-gradient-to-br from-blue-400 to-[#D4AF37] bg-clip-text text-7xl text-blue-500 text-transparent">
                  apartment
                </span>
                <h3 className="font-display mb-2 text-2xl font-bold text-white">
                  Gestão Multi-Escritório
                </h3>
                <p className="font-display leading-relaxed text-[#9da6b9]">
                  Gerencie múltiplas bancas ou filiais com facilidade, alternando entre ambientes
                  com um único clique.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Section: Feature Cards */}
          <div className="mb-12 grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center rounded-xl border border-white/5 bg-[#0f1219]/70 p-6 shadow-lg backdrop-blur-md transition-colors hover:border-blue-500/30">
              <span className="material-symbols-outlined mb-2 text-3xl text-blue-500">domain</span>
              <span className="font-display text-base font-medium text-white">Múltiplos CNPJs</span>
            </div>
            <div className="flex flex-col items-center rounded-xl border border-white/5 bg-[#0f1219]/70 p-6 shadow-lg backdrop-blur-md transition-colors hover:border-[#D4AF37]/30">
              <span className="material-symbols-outlined mb-2 text-3xl text-[#D4AF37]">
                group_add
              </span>
              <span className="font-display text-base font-medium text-white">
                Equipes Dedicadas
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
