'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Bot, Zap, Globe, Menu, X } from 'lucide-react';

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] font-sans text-slate-100 selection:bg-blue-500 selection:text-white">
      {/* Header - Transparent to Glass on Scroll */}
      <header
        className={`fixed top-0 z-50 w-full border-b border-white/5 transition-all duration-300 ${scrolled ? 'bg-[#020617]/80 py-4 backdrop-blur-md' : 'bg-transparent py-6'}`}
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6">
          {/* Logo Container - Clean and Impactful */}
          <div className="relative h-12 w-48">
            <Image
              src="/jurisnexo-logo-new.jpg"
              alt="JurisNexo"
              fill
              className="object-contain object-left"
              priority
            />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 lg:flex">
            {['Planos', 'API', 'Blog', 'Sobre', 'Eventos'].map((item) => (
              <Link
                key={item}
                className="text-[15px] font-medium text-slate-300 transition-colors hover:text-white"
                href="#"
              >
                {item}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden items-center gap-6 lg:flex">
            <Link
              href="/login"
              className="text-[15px] font-bold text-slate-300 transition-colors hover:text-white"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="rounded-full bg-[#2563eb] px-6 py-3 text-[15px] font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all hover:-translate-y-0.5 hover:bg-[#1d4ed8] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]"
            >
              Começar gratuitamente
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="text-white lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <main>
        {/* HERO SECTION - "IMPACT" & "CYBER GRID" */}
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden pt-20">
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
          <div className="relative z-10 mx-auto mt-[-5vh] max-w-5xl px-6 text-center">
            <div className="animate-fade-in-up mb-8 inline-block rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-sm font-semibold text-blue-400">
              Comece hoje mesmo e
            </div>

            <h1 className="animate-fade-in-up mb-8 text-5xl font-bold leading-[1.1] tracking-tight text-white delay-100 md:text-7xl lg:text-[80px]">
              Pare de perder tempo com <br />
              <span className="bg-gradient-to-r from-blue-200 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                tarefas manuais
              </span>
              .
            </h1>

            <p className="animate-fade-in-up mx-auto mb-12 max-w-3xl text-lg font-light leading-relaxed text-slate-400 delay-200 md:text-[22px]">
              Na JurisNexo, desenvolvemos um ecossistema completo que fornece capital tecnológico
              para escritórios que querem competir em igualdade com grandes bancas.
            </p>

            <div className="animate-fade-in-up flex flex-col justify-center gap-6 delay-300 sm:flex-row">
              <Link
                href="/auth/register"
                className="rounded-full bg-[#2563eb] px-12 py-5 text-lg font-bold text-white shadow-[0_0_40px_rgba(37,99,235,0.5)] transition-all hover:scale-105 hover:bg-[#1d4ed8] hover:shadow-[0_0_60px_rgba(37,99,235,0.7)]"
              >
                Começar gratuitamente
              </Link>
              <button className="flex items-center justify-center gap-2 rounded-full border border-white/20 bg-transparent px-12 py-5 text-lg font-bold text-white transition-all hover:border-white/40 hover:bg-white/5">
                <Zap className="h-5 w-5 text-yellow-400" /> Ver Demonstração
              </button>
            </div>
          </div>
        </section>

        {/* Feature Composition */}
        <section className="relative overflow-hidden bg-[#020617] py-24">
          {/* Background Glows */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/20 blur-[120px]"></div>

          <div className="relative z-10 mx-auto max-w-[1400px] px-6">
            {/* Glass Container */}
            <div className="group relative aspect-[21/9] w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] backdrop-blur-[4px] transition-transform duration-500 hover:scale-[1.01]">
              <Image
                src="/landing-composition-v3.png"
                alt="JurisNexo Ecosystem"
                fill
                className="object-cover opacity-90 transition-opacity duration-500 group-hover:opacity-100"
                priority
              />
              {/* Reflection/Sheen effect */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100"></div>
            </div>
          </div>
        </section>

        {/* Metrics Section - Dark Cards with Abstract Bg */}
        <section className="relative overflow-hidden bg-[#020617] py-24">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-900 to-transparent"></div>
          <div className="relative z-10 mx-auto max-w-[1280px] px-6">
            <div className="grid gap-8 md:grid-cols-4">
              {[
                { label: 'Escritórios', val: '+ 5.000', color: 'text-blue-400' },
                { label: 'Usuários Ativos', val: '+ 80.000', color: 'text-cyan-400' },
                { label: 'Processos', val: '+ 5 Milhões', color: 'text-purple-400' },
                { label: 'Honorários', val: '+ 1 Bilhão', color: 'text-emerald-400' },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="hover=-translate-y-2 group relative overflow-hidden rounded-3xl border border-white/5 bg-[#0f172a] p-8 transition-transform duration-300"
                >
                  <Image
                    src="/images/landing/feature-bg.png"
                    alt="bg"
                    fill
                    className="object-cover opacity-20 mix-blend-overlay transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="relative z-10">
                    <h3 className={`mb-2 text-4xl font-bold lg:text-5xl ${stat.color}`}>
                      {stat.val}
                    </h3>
                    <p className="text-sm font-medium uppercase tracking-wider text-slate-400">
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 bg-[#020617] pb-10 pt-20 font-sans">
          <div className="mx-auto grid max-w-[1280px] gap-12 px-6 md:grid-cols-12">
            <div className="md:col-span-4">
              <div className="relative mb-6 h-10 w-40">
                <Image
                  src="/jurisnexo-logo-new.jpg"
                  alt="JurisNexo"
                  fill
                  className="object-contain object-left"
                />
              </div>
              <p className="max-w-sm text-sm font-medium leading-relaxed text-slate-500">
                Plataforma completa de gestão e inteligência jurídica. Estruturamos a atuação de
                escritórios com tecnologia de ponta.
              </p>
              <div className="mt-6 flex gap-4">
                <Link
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white transition-colors hover:bg-blue-600"
                >
                  <Globe size={18} />
                </Link>
                <Link
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white transition-colors hover:bg-blue-600"
                >
                  <Bot size={18} />
                </Link>
              </div>
            </div>

            <div className="md:col-span-2">
              <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-slate-500">
                Planos
              </h4>
              <ul className="space-y-4 text-sm font-medium text-slate-500">
                <li>
                  <Link href="#" className="transition-colors hover:text-blue-400">
                    Start
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition-colors hover:text-blue-400">
                    Pro
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition-colors hover:text-blue-400">
                    Premium
                  </Link>
                </li>
              </ul>
            </div>
            <div className="md:col-span-2">
              <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-slate-500">
                Produto
              </h4>
              <ul className="space-y-4 text-sm font-medium text-slate-500">
                <li>
                  <Link href="#" className="transition-colors hover:text-blue-400">
                    Funcionalidades
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition-colors hover:text-blue-400">
                    Integrações
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition-colors hover:text-blue-400">
                    Segurança
                  </Link>
                </li>
              </ul>
            </div>
            <div className="md:col-span-4">
              <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-blue-900/20 to-transparent p-6">
                <h4 className="mb-2 font-bold text-white">Fale com um consultor</h4>
                <p className="mb-4 text-sm text-slate-500">
                  Tem dúvidas sobre qual o melhor plano para o seu escritório?
                </p>
                <Link
                  href="/contact"
                  className="flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300"
                >
                  Agendar demonstração <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-16 flex max-w-[1280px] items-center justify-between border-t border-white/5 px-6 pt-8 text-center md:text-left">
            <p className="text-sm font-medium text-slate-500">
              © 2026 JurisNexo Tecnologia Jurídica. Todos os direitos reservados.
            </p>
            <div className="flex gap-6 text-sm font-medium text-slate-500">
              <Link href="#" className="hover:text-slate-300">
                Termos
              </Link>
              <Link href="#" className="hover:text-slate-300">
                Privacidade
              </Link>
            </div>
          </div>
        </footer>
      </main>

      <style jsx global>{`
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
          opacity: 0;
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s infinite ease-in-out;
        }
        @keyframes spin-slow-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 20s linear infinite;
        }
        .animate-dash-flow {
          stroke-dasharray: 20;
          animation: dash-flow 2s linear infinite reverse;
        }
        @keyframes dash-flow {
          from {
            stroke-dashoffset: 200;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
