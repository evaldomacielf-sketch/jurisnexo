import { Shield, BarChart3, Scale } from 'lucide-react';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-[#0f172a] text-white overflow-hidden font-sans">
            {/* Left Side - Form Area */}
            <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 lg:p-12 relative z-10">
                <div className="mb-8">
                    {/* Logo Placeholder */}
                    <div className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                        <div className="w-8 h-8 bg-blue-600 rounded-sm skew-x-[-10deg]"></div>
                        JurisNexo
                    </div>
                </div>

                <div className="w-full max-w-sm mx-auto">
                    {children}
                </div>

                <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-500">
                    <span className="w-3 h-3 border border-gray-600 rounded-sm flex items-center justify-center">🔒</span>
                    Ambiente seguro JurisNexo SSL 256-bit
                </div>
            </div>

            {/* Right Side - Marketing Area */}
            <div className="hidden lg:flex w-1/2 bg-[#0B1120] relative flex-col justify-center items-center p-12">
                {/* Background Grid/Effect */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-[#0B1120] via-[#1e293b] to-[#0f172a] opacity-80"></div>

                {/* Floating Card */}
                <div className="relative z-10 w-full max-w-md">
                    <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

                        <div className="flex justify-center mb-6">
                            <Scale className="w-16 h-16 text-blue-500" />
                        </div>

                        <h2 className="text-2xl font-bold text-center mb-4 text-white">Tecnologia para Advogados</h2>
                        <p className="text-center text-gray-400 mb-8 leading-relaxed">
                            Centralize seus processos, documentos e prazos em uma única plataforma inteligente e segura.
                        </p>
                    </div>

                    {/* Bottom Cards */}
                    <div className="flex gap-4 mt-6">
                        <div className="flex-1 bg-[#1e293b]/40 backdrop-blur-md border border-white/5 p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-[#1e293b]/60 transition-colors">
                            <Shield className="w-6 h-6 text-blue-500" />
                            <span className="text-sm font-medium text-gray-300">Segurança Total</span>
                        </div>
                        <div className="flex-1 bg-[#1e293b]/40 backdrop-blur-md border border-white/5 p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-[#1e293b]/60 transition-colors">
                            <BarChart3 className="w-6 h-6 text-blue-500" />
                            <span className="text-sm font-medium text-gray-300">Dados Estratégicos</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
