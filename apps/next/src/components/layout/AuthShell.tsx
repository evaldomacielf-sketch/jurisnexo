import React from 'react';

export function AuthShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-[#f6f6f8] dark:bg-[#101622] items-stretch overflow-hidden font-display">
            {/* Left Side: Form Area */}
            <div className="flex-1 flex flex-col justify-center items-center px-8 lg:px-20 bg-[#f6f6f8] dark:bg-[#101622]">
                <div className="w-full max-w-[440px] flex flex-col">
                    {/* Logo & Brand */}
                    <div className="flex items-center gap-3 text-blue-600 mb-12">
                        <div className="size-8">
                            <svg className="text-blue-600" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"></path>
                            </svg>
                        </div>
                        <h2 className="text-white text-2xl font-bold leading-tight tracking-tight font-display">JurisNexo</h2>
                    </div>

                    {children}

                    {/* Footer Small Print */}
                    <div className="mt-16 flex items-center justify-center gap-2 text-[#4f5b76]">
                        <span className="material-symbols-outlined text-sm">lock</span>
                        <span className="text-xs font-display">Ambiente seguro JurisNexo SSL 256-bit</span>
                    </div>
                </div>
            </div>

            {/* Right Side: Abstract Illustration */}
            <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-[#111318] via-[#1152d4]/10 to-[#1c2230] items-center justify-center overflow-hidden">
                {/* Abstract Tech Elements */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-400 rounded-full blur-[100px]"></div>
                </div>

                <div className="relative z-10 p-12 text-center max-w-[600px]">
                    <div className="mb-8 flex justify-center">
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl blur opacity-25"></div>
                            <div className="relative bg-[#1c2230] border border-[#3b4354] rounded-2xl p-8 shadow-2xl">
                                <span className="material-symbols-outlined text-blue-600 text-7xl mb-4">gavel</span>
                                <h3 className="text-white text-2xl font-bold mb-4 font-display">Tecnologia para Advogados</h3>
                                <p className="text-[#9da6b9] leading-relaxed font-display">Centralize seus processos, documentos e prazos em uma única plataforma inteligente e segura.</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="flex flex-col items-center bg-[#1c2230]/50 p-4 rounded-xl border border-white/5">
                            <span className="material-symbols-outlined text-blue-600 mb-2">shield</span>
                            <span className="text-white text-sm font-medium font-display">Segurança Total</span>
                        </div>
                        <div className="flex flex-col items-center bg-[#1c2230]/50 p-4 rounded-xl border border-white/5">
                            <span className="material-symbols-outlined text-blue-600 mb-2">analytics</span>
                            <span className="text-white text-sm font-medium font-display">Dados Estratégicos</span>
                        </div>
                    </div>
                </div>

                {/* Pattern Background */}
                <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
            </div>
        </div>
    );
}
