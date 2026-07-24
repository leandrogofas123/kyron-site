"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Logo } from "./Logo";
import { CTA_PRIMARIO, NAV_PRINCIPAL } from "@/lib/kyron/site";

export function Header() {
  const [rolou, setRolou] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);

  // Único uso de glassmorphism no site: separa camadas sem ocupar área.
  useEffect(() => {
    const onScroll = () => setRolou(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuAberto) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuAberto(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuAberto]);

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
          </div>
        </div>
      )}
    </header>
  );
}
