'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    ArrowRight, Bot, Zap, Globe, Menu, X
} from 'lucide-react';

const LandingPage = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="bg-[#020617] text-slate-100 font-sans min-h-screen selection:bg-blue-500 selection:text-white">

            {/* Header - Transparent to Glass on Scroll */}
            <header className={`fixed top-0 w-full z-50 transition-all duration-300 border-b border-white/5 ${scrolled ? 'bg-[#020617]/80 backdrop-blur-md py-4' : 'bg-transparent py-6'}`}>
                <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6">
                    {/* Logo Container - Clean and Impactful */}
                    <div className="h-12 w-48 relative">
                        <Image src="/jurisnexo-logo-new.jpg" alt="JurisNexo" fill className="object-contain object-left" priority />
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-8">
                        {['Planos', 'API', 'Blog', 'Sobre', 'Eventos'].map((item) => (
                            <Link key={item} className="text-[15px] font-medium text-slate-300 hover:text-white transition-colors" href="#">{item}</Link>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="hidden lg:flex items-center gap-6">
                        <Link href="/login" className="text-[15px] font-bold text-slate-300 hover:text-white transition-colors">Login</Link>
                        <Link href="/auth/register" className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[15px] font-bold px-6 py-3 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] transition-all hover:-translate-y-0.5">
                            Começar gratuitamente
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button className="lg:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </header>

            <main>
                {/* HERO SECTION - "IMPACT" & "CYBER GRID" */}
                <section className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden pt-20">

                    {/* Cyber Network Background Image */}
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/images/landing/hero-bg.png"
                            alt="Cyber Network Background"
                            fill
                            className="object-cover opacity-60 mix-blend-screen"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/80 via-transparent to-[#020617]"></div>
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#020617_80%)]"></div>
                    </div>

                    {/* Hero Content - Centered & Impactful */}
                    <div className="relative z-10 max-w-5xl mx-auto px-6 text-center mt-[-5vh]">

                        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold text-sm mb-8 animate-fade-in-up">
                            Comece hoje mesmo e
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-[80px] font-bold text-white mb-8 tracking-tight leading-[1.1] animate-fade-in-up delay-100">
                            Pare de perder tempo com <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-blue-400 to-cyan-400">tarefas manuais</span>.
                        </h1>

                        <p className="text-slate-400 text-lg md:text-[22px] leading-relaxed max-w-3xl mx-auto mb-12 font-light animate-fade-in-up delay-200">
                            Na JurisNexo, desenvolvemos um ecossistema completo que fornece capital tecnológico para escritórios que querem competir em igualdade com grandes bancas.
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center gap-6 animate-fade-in-up delay-300">
                            <Link href="/auth/register" className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-lg font-bold px-12 py-5 rounded-full shadow-[0_0_40px_rgba(37,99,235,0.5)] hover:shadow-[0_0_60px_rgba(37,99,235,0.7)] transition-all hover:scale-105">
                                Começar gratuitamente
                            </Link>
                            <button className="bg-transparent border border-white/20 text-white hover:bg-white/5 hover:border-white/40 text-lg font-bold px-12 py-5 rounded-full transition-all flex items-center gap-2 justify-center">
                                <Zap className="w-5 h-5 text-yellow-400" /> Ver Demonstração
                            </button>
                        </div>

                    </div>
                </section>

                {/* Feature Composition */}
                <section className="py-24 relative bg-[#020617] overflow-hidden">
                    {/* Background Glows */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>

                    <div className="max-w-[1400px] mx-auto px-6 relative z-10">
                        {/* Glass Container */}
                        <div className="relative w-full aspect-[21/9] rounded-3xl overflow-hidden border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] backdrop-blur-[4px] bg-white/5 group transition-transform duration-500 hover:scale-[1.01]">
                            <Image
                                src="/landing-composition-v3.png"
                                alt="JurisNexo Ecosystem"
                                fill
                                className="object-cover opacity-90 transition-opacity duration-500 group-hover:opacity-100"
                                priority
                            />
                            {/* Reflection/Sheen effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                        </div>
                    </div>
                </section>

                {/* Metrics Section - Dark Cards with Abstract Bg */}
                <section className="py-24 relative overflow-hidden bg-[#020617]">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-900 to-transparent"></div>
                    <div className="max-w-[1280px] mx-auto px-6 relative z-10">
                        <div className="grid md:grid-cols-4 gap-8">
                            {[
                                { label: 'Escritórios', val: '+ 5.000', color: 'text-blue-400' },
                                { label: 'Usuários Ativos', val: '+ 80.000', color: 'text-cyan-400' },
                                { label: 'Processos', val: '+ 5 Milhões', color: 'text-purple-400' },
                                { label: 'Honorários', val: '+ 1 Bilhão', color: 'text-emerald-400' }
                            ].map((stat, i) => (
                                <div key={i} className="relative p-8 rounded-3xl overflow-hidden bg-[#0f172a] border border-white/5 group hover=-translate-y-2 transition-transform duration-300">
                                    <Image src="/images/landing/feature-bg.png" alt="bg" fill className="object-cover opacity-20 mix-blend-overlay transition-transform duration-700 group-hover:scale-110" />
                                    <div className="relative z-10">
                                        <h3 className={`text-4xl lg:text-5xl font-bold mb-2 ${stat.color}`}>{stat.val}</h3>
                                        <p className="text-slate-400 font-medium uppercase tracking-wider text-sm">{stat.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-[#020617] pt-20 pb-10 border-t border-white/5 font-sans">
                    <div className="max-w-[1280px] mx-auto px-6 grid md:grid-cols-12 gap-12">
                        <div className="md:col-span-4">
                            <div className="h-10 w-40 relative mb-6">
                                <Image src="/jurisnexo-logo-new.jpg" alt="JurisNexo" fill className="object-contain object-left" />
                            </div>
                            <p className="text-slate-500 text-sm leading-relaxed max-w-sm font-medium">
                                Plataforma completa de gestão e inteligência jurídica. Estruturamos a atuação de escritórios com tecnologia de ponta.
                            </p>
                            <div className="flex gap-4 mt-6">
                                <Link href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-600 transition-colors text-white"><Globe size={18} /></Link>
                                <Link href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-600 transition-colors text-white"><Bot size={18} /></Link>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <h4 className="text-slate-500 font-bold mb-6 text-sm uppercase tracking-wider">Planos</h4>
                            <ul className="space-y-4 text-slate-500 text-sm font-medium">
                                <li><Link href="#" className="hover:text-blue-400 transition-colors">Start</Link></li>
                                <li><Link href="#" className="hover:text-blue-400 transition-colors">Pro</Link></li>
                                <li><Link href="#" className="hover:text-blue-400 transition-colors">Premium</Link></li>
                            </ul>
                        </div>
                        <div className="md:col-span-2">
                            <h4 className="text-slate-500 font-bold mb-6 text-sm uppercase tracking-wider">Produto</h4>
                            <ul className="space-y-4 text-slate-500 text-sm font-medium">
                                <li><Link href="#" className="hover:text-blue-400 transition-colors">Funcionalidades</Link></li>
                                <li><Link href="#" className="hover:text-blue-400 transition-colors">Integrações</Link></li>
                                <li><Link href="#" className="hover:text-blue-400 transition-colors">Segurança</Link></li>
                            </ul>
                        </div>
                        <div className="md:col-span-4">
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/20 to-transparent border border-white/5">
                                <h4 className="text-white font-bold mb-2">Fale com um consultor</h4>
                                <p className="text-slate-500 text-sm mb-4">Tem dúvidas sobre qual o melhor plano para o seu escritório?</p>
                                <Link href="/contact" className="text-blue-400 font-bold text-sm hover:text-blue-300 flex items-center gap-2">
                                    Agendar demonstração <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-[1280px] mx-auto px-6 mt-16 pt-8 border-t border-white/5 text-center md:text-left flex justify-between items-center">
                        <p className="text-slate-500 text-sm font-medium">© 2026 JurisNexo Tecnologia Jurídica. Todos os direitos reservados.</p>
                        <div className="flex gap-6 text-sm text-slate-500 font-medium">
                            <Link href="#" className="hover:text-slate-300">Termos</Link>
                            <Link href="#" className="hover:text-slate-300">Privacidade</Link>
                        </div>
                    </div>
                </footer>

            </main>

            <style jsx global>{`
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
          opacity: 0;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        
        @keyframes fade-in-up {
           from { opacity: 0; transform: translateY(30px); }
           to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-slow {
           0%, 100% { opacity: 1; transform: scale(1); }
           50% { opacity: 0.8; transform: scale(1.05); }
        }
        .animate-pulse-slow {
           animation: pulse-slow 4s infinite ease-in-out;
        }
        @keyframes spin-slow-reverse {
           from { transform: rotate(360deg); }
           to { transform: rotate(0deg); }
        }
        .animate-spin-slow-reverse {
           animation: spin-slow-reverse 20s linear infinite;
        }
        .animate-dash-flow {
           stroke-dasharray: 20;
           animation: dash-flow 2s linear infinite reverse;
        }
        @keyframes dash-flow {
           from { stroke-dashoffset: 200; }
           to { stroke-dashoffset: 0; }
        }
      `}</style>
        </div>
    );
};

export default LandingPage;
