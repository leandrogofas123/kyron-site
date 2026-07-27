"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Logo } from "./Logo";
import { CTA_PRIMARIO, NAV_PRINCIPAL } from "@/lib/kyron/site";

export function Header({
  sidebarAberta = false,
  onAlternarSidebar,
}: {
  sidebarAberta?: boolean;
  onAlternarSidebar?: () => void;
}) {
  const [rolou, setRolou] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    const onScroll = () => setRolou(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Só o menu mobile trava a rolagem; a barra lateral do desktop convive
  // com a página (fica acoplada, não sobreposta).
  useEffect(() => {
    if (!menuAberto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuAberto(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuAberto]);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors duration-300 ${
        rolou
          ? "border-[var(--kyron-hairline)] bg-kyron-graphite/[0.92] backdrop-blur-[16px]"
          : "border-[var(--kyron-hairline)] bg-kyron-black/95 backdrop-blur-[10px]"
      }`}
    >
      {/* NÍVEL 1 — logo + busca (no topo) + ações */}
      <div className="container-kyron flex h-[clamp(3.5rem,6vw,4.25rem)] items-center gap-fluid-sm">
        <Logo altura={30} prioridade />

        <form
          action="/produtos"
          role="search"
          className="mx-auto min-w-0 flex-1 sm:max-w-[36rem]"
        >
          <label htmlFor="busca-topo" className="sr-only">
            Buscar produtos
          </label>
          <div className="flex min-w-0 items-center rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-black/50 transition-colors focus-within:border-[var(--kyron-blue-line)]">
            <SearchIcon className="ml-2.5 shrink-0 text-kyron-silver/55" />
            <input
              id="busca-topo"
              name="q"
              type="search"
              placeholder="Buscar produtos, iPhone, acessórios…"
              className="min-w-0 flex-1 bg-transparent py-2.5 pl-2 pr-3 text-fluid-sm text-kyron-white placeholder:text-kyron-silver/45 focus:outline-none"
            />
          </div>
        </form>

        {/* Ações — desktop */}
        <div className="hidden shrink-0 items-center gap-fluid-sm lg:flex">
          <Link
            href={CTA_PRIMARIO.href}
            className="kyron-label whitespace-nowrap rounded-kyron-sm bg-kyron-blue px-fluid-sm py-fluid-2xs text-fluid-2xs text-white transition-all duration-300 hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(30,107,255,0.28)]"
          >
            {CTA_PRIMARIO.label}
          </Link>
          <Link
            href="/admin/login"
            aria-label="Entrar no painel administrativo"
            title="Painel administrativo"
            className="flex h-9 w-9 items-center justify-center rounded-kyron-sm border border-[var(--kyron-hairline)] text-kyron-silver transition-colors duration-300 hover:border-[var(--kyron-blue-line)] hover:text-kyron-white"
          >
            <LockIcon />
          </Link>
        </div>

        {/* Menu — mobile */}
        <button
          type="button"
          onClick={() => setMenuAberto(true)}
          aria-label="Abrir menu"
          aria-expanded={menuAberto}
          className="flex h-11 w-11 shrink-0 items-center justify-center text-kyron-silver lg:hidden"
        >
          <MenuIcon />
        </button>
      </div>

      {/* NÍVEL 2 — departamentos + navegação (desktop).
          Com a barra lateral aberta, esta faixa some: a navegação passa a ser
          feita pela lateral, sem duplicar comandos na tela. */}
      {!sidebarAberta && (
        <div className="hidden border-t border-[var(--kyron-hairline)] lg:block">
          <div className="container-kyron flex h-[clamp(2.5rem,3.5vw,3rem)] items-center gap-fluid-md">
            <button
              type="button"
              onClick={onAlternarSidebar}
              aria-expanded={sidebarAberta}
              aria-controls="departamentos-kyron"
              className="flex shrink-0 items-center gap-2 rounded-kyron-sm bg-kyron-blue/10 px-3 py-1.5 text-fluid-2xs text-kyron-white transition-colors hover:bg-kyron-blue/20"
            >
              <MenuIcon size={16} />
              <span>Departamentos</span>
            </button>

            <nav
              aria-label="Navegação principal"
              className="kyron-scroll flex items-center gap-fluid-md overflow-x-auto"
            >
              {NAV_PRINCIPAL.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="whitespace-nowrap text-fluid-xs text-kyron-silver transition-colors duration-300 hover:text-kyron-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* MENU MOBILE */}
      {menuAberto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação"
          className="fixed inset-0 z-50 flex flex-col bg-kyron-black lg:hidden"
        >
          <div className="container-kyron flex h-[clamp(3.5rem,6vw,4.25rem)] items-center justify-between">
            <Logo href={null} altura={30} />
            <button
              type="button"
              onClick={() => setMenuAberto(false)}
              aria-label="Fechar menu"
              autoFocus
              className="flex h-11 w-11 items-center justify-center text-kyron-silver"
            >
              <FecharIcon />
            </button>
          </div>

          <div className="container-kyron pt-fluid-sm">
            <button
              type="button"
              onClick={() => {
                setMenuAberto(false);
                onAlternarSidebar?.();
              }}
              className="flex w-full items-center gap-2 rounded-kyron-sm bg-kyron-blue/10 px-fluid-sm py-fluid-sm text-fluid-sm text-kyron-white"
            >
              <MenuIcon size={18} />
              Departamentos
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
                className="kyron-display py-fluid-xs text-fluid-xl text-kyron-white"
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
              Painel administrativo
            </Link>
          </div>
        </div>
      )}

    </header>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.7" />
      <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FecharIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m6 6 12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
