import React from 'react';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-[#f6f6f8] dark:bg-[#101622] items-stretch overflow-hidden font-display">
            {/* Left Side: Form Area */}
            <div className="flex-1 flex flex-col justify-center items-center px-8 lg:px-20 bg-[#f6f6f8] text-[#0A0E27] !text-[#0A0E27] relative overflow-hidden">
                {/* Watermark Background */}
                <div
                    className="absolute inset-0 z-0 bg-center bg-no-repeat bg-cover opacity-10 pointer-events-none bg-[url('/images/jurisnexo-watermark.png')]"
                ></div>

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

                    {children}

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
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-50 mix-blend-normal bg-[url('/images/law_office_tech.png')]"
                ></div>

                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 z-1 bg-gradient-to-t from-[#0A0E27] via-[#0A0E27]/40 to-transparent"></div>

                {/* Abstract Tech Elements - Preserved for "connections" feel */}
                <div className="absolute inset-0 opacity-30 pointer-events-none z-2">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[120px] mix-blend-color-dodge"></div>
                </div>

                <div className="relative z-10 p-12 w-full h-full flex flex-col justify-between max-w-[600px]">
                    {/* Top Section: Main Card */}
                    <div className="flex justify-center mt-0 pt-8">
                        <div className="relative group w-full">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-[#D4AF37] rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                            <div className="relative bg-[#1c2230]/60 backdrop-blur-xl border border-[#3b4354] rounded-2xl px-8 py-5 shadow-2xl text-center">
                                <span className="material-symbols-outlined text-blue-500 text-7xl mb-2 bg-clip-text text-transparent bg-gradient-to-br from-blue-400 to-[#D4AF37]">gavel</span>
                                <h3 className="text-white text-2xl font-bold mb-2 font-display">Tecnologia para Advogados</h3>
                                <p className="text-[#9da6b9] leading-relaxed font-display">Centralize seus processos, documentos e prazos em uma única plataforma inteligente e segura.</p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section: Feature Cards */}
                    <div className="grid grid-cols-2 gap-4 mb-12">
                        <div className="flex flex-col items-center bg-[#0f1219]/70 backdrop-blur-md p-6 rounded-xl border border-white/5 hover:border-blue-500/30 transition-colors shadow-lg">
                            <span className="material-symbols-outlined text-blue-500 mb-2 text-3xl">shield</span>
                            <span className="text-white text-base font-medium font-display">Segurança Total</span>
                        </div>
                        <div className="flex flex-col items-center bg-[#0f1219]/70 backdrop-blur-md p-6 rounded-xl border border-white/5 hover:border-[#D4AF37]/30 transition-colors shadow-lg">
                            <span className="material-symbols-outlined text-[#D4AF37] mb-2 text-3xl">analytics</span>
                            <span className="text-white text-base font-medium font-display">Dados Estratégicos</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
