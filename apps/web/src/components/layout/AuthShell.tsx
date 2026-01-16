import React from 'react';
import Image from 'next/image';

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-display flex min-h-screen items-stretch overflow-hidden bg-[#f6f6f8] dark:bg-[#101622]">
      {/* Left Side: Form Area */}
      <div className="flex flex-1 flex-col items-center justify-center bg-[#f6f6f8] px-8 dark:bg-[#101622] lg:px-20">
        <div className="flex w-full max-w-[440px] flex-col">
          {/* Logo & Brand */}
          <div className="mb-12 flex items-center justify-center">
            <div className="relative h-12 w-full max-w-[200px]">
              <Image
                src="/logo-full.png"
                alt="JurisNexo Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {children}

          {/* Footer Small Print */}
          <div className="mt-16 flex items-center justify-center gap-2 text-[#4f5b76]">
            <span className="material-symbols-outlined text-sm">lock</span>
            <span className="font-display text-xs">Ambiente seguro JurisNexo SSL 256-bit</span>
          </div>
        </div>
      </div>

      {/* Right Side: Abstract Illustration */}
      <div className="relative hidden flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-[#111318] via-[#1152d4]/10 to-[#1c2230] lg:flex">
        {/* Abstract Tech Elements */}
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-blue-600 blur-[120px]"></div>
          <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-blue-400 blur-[100px]"></div>
        </div>

        <div className="relative z-10 max-w-[600px] p-12 text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-400 opacity-25 blur"></div>
              <div className="relative rounded-2xl border border-[#3b4354] bg-[#1c2230] p-8 shadow-2xl">
                <span className="material-symbols-outlined mb-4 text-7xl text-blue-600">gavel</span>
                <h3 className="font-display mb-4 text-2xl font-bold text-white">
                  Tecnologia para Advogados
                </h3>
                <p className="font-display leading-relaxed text-[#9da6b9]">
                  Centralize seus processos, documentos e prazos em uma única plataforma inteligente
                  e segura.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center rounded-xl border border-white/5 bg-[#1c2230]/50 p-4">
              <span className="material-symbols-outlined mb-2 text-blue-600">shield</span>
              <span className="font-display text-sm font-medium text-white">Segurança Total</span>
            </div>
            <div className="flex flex-col items-center rounded-xl border border-white/5 bg-[#1c2230]/50 p-4">
              <span className="material-symbols-outlined mb-2 text-blue-600">analytics</span>
              <span className="font-display text-sm font-medium text-white">
                Dados Estratégicos
              </span>
            </div>
          </div>
        </div>

        {/* Pattern Background */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[length:30px_30px] opacity-[0.03]"></div>
      </div>
    </div>
  );
}
