"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Logo } from "./Logo";
import { CTA_PRIMARIO } from "@/lib/kyron/site";

/** Acesso rápido — módulos principais unidos, no topo. */
const RAPIDO = [
  { label: "Início", href: "/" },
  { label: "Produtos", href: "/produtos" },
  { label: "Seminovos", href: "/seminovos" },
  { label: "Casa Inteligente", href: "/produtos?categoria=casa-inteligente" },
  { label: "Áudio", href: "/produtos?categoria=audio" },
  { label: "Acessórios", href: "/produtos?categoria=acessorios" },
  { label: "Serviços", href: "/servicos" },
  { label: "Manual & Aulas", href: "/manual" },
  { label: "Contato", href: "/contato" },
];

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
  const pathname = usePathname();

  // Link ativo por rota (categorias, que compartilham /produtos, ficam só com
  // o hover azul — sem depender de useSearchParams, que exigiria Suspense).
  const ehAtivo = (href: string) => {
    if (href.includes("?")) return false;
    if (href === "/") return pathname === "/";
    return pathname === href;
  };

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
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-kyron-sm text-kyron-silver transition-colors hover:bg-kyron-blue/10 hover:text-kyron-white"
        >
          {sidebarAberta ? <FecharIcon /> : <MenuIcon />}
        </button>

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

        <Link
          href={CTA_PRIMARIO.href}
          className="kyron-label hidden shrink-0 whitespace-nowrap rounded-kyron-sm bg-kyron-blue px-fluid-sm py-fluid-2xs text-fluid-2xs text-white transition-all duration-300 hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(30,107,255,0.28)] sm:block"
        >
          {CTA_PRIMARIO.label}
        </Link>
      </div>

      {/* Acesso rápido aos módulos principais — botões com hover azul */}
      <nav aria-label="Acesso rápido" className="border-t border-[var(--kyron-hairline)]">
        <div className="kyron-scroll container-kyron flex gap-1 overflow-x-auto py-1.5">
          {RAPIDO.map((l) => {
            const ativo = ehAtivo(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`kyron-label whitespace-nowrap rounded-kyron-sm px-fluid-sm py-fluid-2xs text-fluid-2xs transition-colors ${
                  ativo
                    ? "bg-kyron-blue text-white"
                    : "text-kyron-silver hover:bg-kyron-blue hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </nav>
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
