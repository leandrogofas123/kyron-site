"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Logo } from "./Logo";
import { DepartmentDrawer } from "./DepartmentDrawer";
import { CTA_PRIMARIO, NAV_PRINCIPAL } from "@/lib/kyron/site";

export function Header() {
  const [rolou, setRolou] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [departamentosAbertos, setDepartamentosAbertos] = useState(false);

  // Único uso de glassmorphism no site: separa camadas sem ocupar área.
  useEffect(() => {
    const onScroll = () => setRolou(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuAberto && !departamentosAbertos) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuAberto(false);
        setDepartamentosAbertos(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [departamentosAbertos, menuAberto]);

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-[400ms] ease-in-out ${
        rolou
          ? "border-b border-[var(--kyron-hairline)] bg-kyron-graphite/[0.88] backdrop-blur-[16px]"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      {/* Altura fluida: acompanha o tamanho do texto e da tela. */}
      <div className="container-kyron flex h-[clamp(3.75rem,7vw,4.5rem)] items-center justify-between">
        {/* prioridade: o logo faz parte do LCP do topo da página. */}
        <Logo altura={30} prioridade />

        <button
          type="button"
          onClick={() => setDepartamentosAbertos(true)}
          aria-expanded={departamentosAbertos}
          aria-controls="departamentos-kyron"
          className="hidden min-h-10 items-center gap-2 rounded-kyron-sm border border-[var(--kyron-hairline)] px-2.5 text-fluid-2xs text-kyron-silver transition-colors hover:border-[var(--kyron-blue-line)] hover:text-kyron-white lg:flex"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <span className="hidden xl:inline">Departamentos</span>
        </button>

        <form action="/produtos" className="hidden min-w-0 flex-1 2xl:flex 2xl:max-w-[14rem]">
          <label htmlFor="busca-topo" className="sr-only">Buscar produtos</label>
          <div className="flex min-w-0 flex-1 items-center rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-black/40 focus-within:border-[var(--kyron-blue-line)]">
            <svg className="ml-2 shrink-0 text-kyron-silver/55" width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.7" /><path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
            <input id="busca-topo" name="q" type="search" placeholder="Buscar produtos" className="min-w-0 flex-1 bg-transparent py-2 pl-1 pr-2 text-fluid-2xs text-kyron-white placeholder:text-kyron-silver/45 focus:outline-none" />
          </div>
        </form>

        <nav
          aria-label="Navegação principal"
          className="hidden items-center gap-fluid-md lg:flex"
        >
          {NAV_PRINCIPAL.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-fluid-sm text-kyron-silver transition-colors duration-300 hover:text-kyron-white"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={CTA_PRIMARIO.href}
            className="kyron-label rounded-kyron-sm bg-kyron-blue px-fluid-sm py-fluid-2xs text-fluid-2xs text-white transition-all duration-300 hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(30,107,255,0.28)]"
          >
            {CTA_PRIMARIO.label}
          </Link>
          <Link
            href="/admin/login"
            aria-label="Entrar no painel administrativo"
            title="Painel admin"
            className="flex h-9 w-9 items-center justify-center rounded-kyron-sm border border-[var(--kyron-hairline)] text-kyron-silver transition-colors duration-300 hover:border-[var(--kyron-blue-line)] hover:text-kyron-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </Link>
        </nav>

        {/* Alvo de toque nunca abaixo de 44px, mesmo em telas pequenas. */}
        <button
          type="button"
          onClick={() => setMenuAberto(true)}
          aria-label="Abrir menu"
          aria-expanded={menuAberto}
          className="flex h-11 w-11 items-center justify-center text-kyron-silver lg:hidden"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {menuAberto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação"
          className="fixed inset-0 z-50 flex flex-col bg-kyron-black lg:hidden"
        >
          <div className="container-kyron flex h-[clamp(3.75rem,7vw,4.5rem)] items-center justify-between">
            <Logo href={null} altura={30} />
            <button
              type="button"
              onClick={() => setMenuAberto(false)}
              aria-label="Fechar menu"
              autoFocus
              className="flex h-11 w-11 items-center justify-center text-kyron-silver"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <nav
            aria-label="Navegação principal"
            className="container-kyron flex flex-1 flex-col gap-1 pt-fluid-md"
          >
            {NAV_PRINCIPAL.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuAberto(false)}
                className="kyron-display py-fluid-xs text-fluid-2xl text-kyron-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="container-kyron border-t border-[var(--kyron-hairline)] py-fluid-md">
            <Link
              href={CTA_PRIMARIO.href}
              onClick={() => setMenuAberto(false)}
              className="kyron-label block rounded-kyron-sm bg-kyron-blue py-fluid-sm text-center text-fluid-xs text-white"
            >
              {CTA_PRIMARIO.label}
            </Link>
            <Link
              href="/admin/login"
              onClick={() => setMenuAberto(false)}
              className="kyron-label mt-fluid-sm block py-fluid-2xs text-center text-fluid-2xs text-kyron-silver/70"
            >
              Painel admin
            </Link>
          </div>
        </div>
      )}
      <DepartmentDrawer aberto={departamentosAbertos} onFechar={() => setDepartamentosAbertos(false)} />
    </header>
  );
}
