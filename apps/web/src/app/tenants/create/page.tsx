'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function CreateTenantPage() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/tenants`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
          credentials: 'include',
        }
      );

      if (res.ok) {
        const tenant = await res.json();
        const resActive = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api'}/tenants/me/active-tenant`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tenantId: tenant.id }),
            credentials: 'include',
          }
        );

        if (resActive.ok) {
          const dataActive = await resActive.json();
          if (dataActive.token) {
            document.cookie = `access_token=${dataActive.token}; path=/; max-age=86400; SameSite=Lax`;
          }
          router.push('/dashboard');
        } else {
          alert('Erro ao selecionar escritório recém-criado.');
        }
      } else {
        alert('Erro ao criar escritório. Tente novamente.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

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
                alt="JurisNexo"
                className="h-full w-full object-contain"
              />
            </div>
            <h2 className="font-display text-2xl font-bold leading-tight tracking-tight text-[#0A0E27]">
              Crm Juridico + Whatsapp
            </h2>
          </div>

          <div className="mb-8">
            <h1 className="font-display mb-2 text-[32px] font-bold leading-tight tracking-tight !text-[#0A0E27] text-[#0A0E27]">
              Criar Novo Escritório
            </h1>
            <p className="font-display text-base font-normal leading-normal text-[#4f5b76]">
              Configure seu ambiente profissional de trabalho.
            </p>
          </div>

          <form onSubmit={handleCreate} className="flex w-full flex-col gap-6">
            <div className="flex w-full flex-col">
              <label className="flex w-full flex-col">
                <p className="font-display pb-2 text-sm font-medium leading-normal text-[#0A0E27]">
                  Nome do Escritório
                </p>
                <input
                  type="text"
                  placeholder="Ex: Silva & Associados"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="box-border flex h-14 w-full appearance-none rounded-lg border border-slate-300 !bg-white bg-white px-4 text-base font-normal !text-[#0A0E27] text-[#0A0E27] shadow-sm transition-all placeholder:text-slate-400 focus:border-[#1152d4] focus:outline-none focus:ring-2 focus:ring-[#1152d4]/50"
                  required
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="font-display flex h-14 w-full cursor-pointer items-center justify-center rounded-lg bg-[#1152d4] text-base font-bold text-white shadow-lg transition-all hover:bg-[#0e44b1] hover:shadow-xl active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Escritório'
              )}
            </button>
          </form>

          <button
            onClick={() => router.back()}
            className="font-display mt-6 flex items-center justify-center gap-2 text-sm text-[#616f89] transition-colors hover:text-[#1152d4]"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Voltar para Seleção
          </button>

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
                  rocket_launch
                </span>
                <h3 className="font-display mb-2 text-2xl font-bold text-white">Comece Agora</h3>
                <p className="font-display leading-relaxed text-[#9da6b9]">
                  Crie seu escritório digital em segundos e tenha acesso imediato a todas as
                  ferramentas de gestão.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Section: Feature Cards */}
          <div className="mb-12 grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center rounded-xl border border-white/5 bg-[#0f1219]/70 p-6 shadow-lg backdrop-blur-md transition-colors hover:border-blue-500/30">
              <span className="material-symbols-outlined mb-2 text-3xl text-blue-500">bolt</span>
              <span className="font-display text-base font-medium text-white">Setup Rápido</span>
            </div>
            <div className="flex flex-col items-center rounded-xl border border-white/5 bg-[#0f1219]/70 p-6 shadow-lg backdrop-blur-md transition-colors hover:border-[#D4AF37]/30">
              <span className="material-symbols-outlined mb-2 text-3xl text-[#D4AF37]">
                workspace_premium
              </span>
              <span className="font-display text-base font-medium text-white">14 dias Grátis</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
