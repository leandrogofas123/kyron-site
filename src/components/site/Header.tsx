"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Logo } from "./Logo";
import { TemaToggle } from "./TemaToggle";
import { CTA_PRIMARIO } from "@/lib/kyron/site";

/**
 * Cabeçalho da loja: logo, busca e o botão que oculta/mostra o MENU LATERAL —
 * a navegação vive toda na lateral (fixa no desktop), sem barra de menu no topo.
 */
export function Header({
  sidebarAberta = false,
  onAlternarSidebar,
}: {
  sidebarAberta?: boolean;
  onAlternarSidebar?: () => void;
}) {
  const [rolou, setRolou] = useState(false);

  useEffect(() => {
    const onScroll = () => setRolou(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors duration-300 ${
        rolou
          ? "border-[var(--kyron-hairline)] bg-kyron-graphite/[0.92] backdrop-blur-[16px]"
          : "border-[var(--kyron-hairline)] bg-kyron-black/95 backdrop-blur-[10px]"
      }`}
    >
      <div className="container-kyron flex h-[clamp(3.5rem,6vw,4.25rem)] items-center gap-fluid-sm">
        {/* Botão do menu lateral — oculta / mostra */}
        <button
          type="button"
          onClick={onAlternarSidebar}
          aria-label={sidebarAberta ? "Ocultar menu" : "Mostrar menu"}
          aria-expanded={sidebarAberta}
          aria-controls="departamentos-kyron"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-kyron-sm text-kyron-silver transition-colors hover:bg-kyron-blue/10 hover:text-kyron-white lg:hidden"
        >
          {sidebarAberta ? <FecharIcon /> : <MenuIcon />}
        </button>

        <Logo variante="simbolo" altura={40} prioridade />

        <form
          action="/produtos"
          role="search"
          className="mx-auto min-w-0 flex-1 sm:max-w-[36rem]"
        >
          <label htmlFor="busca-topo" className="sr-only">
            Buscar produtos
          </label>
          <div className="flex min-w-0 items-center rounded-kyron-sm border-2 border-[var(--kyron-hairline)] bg-kyron-black/50 transition-colors focus-within:border-kyron-blue">
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

        <TemaToggle />

        <Link
          href={CTA_PRIMARIO.href}
          className="kyron-label hidden shrink-0 items-center gap-2 whitespace-nowrap rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-xs text-fluid-2xs text-white transition-all duration-300 hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(30,107,255,0.28)] sm:inline-flex"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
          {CTA_PRIMARIO.label}
        </Link>
      </div>
    </header>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.7" />
      <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function FecharIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
