"use client";

import { useEffect, useState, type ReactNode } from "react";

import { Footer } from "./Footer";
import { Header } from "./Header";
import { SidebarDepartamentos } from "./SidebarDepartamentos";

/**
 * Casca da loja: cabeçalho + o MENU LATERAL (única navegação — não há barra de
 * menu no topo). No desktop o menu fica FIXO e aberto por padrão; um botão no
 * cabeçalho oculta/mostra. O estado é lembrado (localStorage) entre visitas e
 * persiste durante a navegação (o layout não remonta).
 */
export function ShellSite({ children }: { children: ReactNode }) {
  const [aberta, setAberta] = useState(false);

  useEffect(() => {
    try {
      const salvo = localStorage.getItem("kyron_menu");
      const desktop = window.matchMedia("(min-width: 1024px)").matches;
      setAberta(salvo != null ? salvo === "1" : desktop);
    } catch {
      /* sem localStorage: segue fechado */
    }
  }, []);

  const gravar = (v: boolean) => {
    try {
      localStorage.setItem("kyron_menu", v ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  const alternar = () => setAberta((v) => { gravar(!v); return !v; });

  return (
    <div className="site-recua">
      <Header sidebarAberta={aberta} onAlternarSidebar={alternar} />

      {/* "Orelhinha" azul ao lado da lateral — abrir/fechar no desktop. */}
      <button
        type="button"
        onClick={alternar}
        aria-label={aberta ? "Fechar menu lateral" : "Abrir menu lateral"}
        aria-controls="departamentos-kyron"
        aria-expanded={aberta}
        style={{ left: aberta ? "17rem" : "0" }}
        className="fixed top-1/2 z-40 hidden h-14 w-6 -translate-y-1/2 items-center justify-center rounded-r-kyron-sm bg-kyron-blue text-white shadow-[0_4px_16px_rgba(30,107,255,0.45)] transition-[left,width] duration-300 hover:w-7 lg:flex"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d={aberta ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
        </svg>
      </button>

      <div className="flex">
        <SidebarDepartamentos aberta={aberta} onFechar={() => { gravar(false); setAberta(false); }} />

        <div className="min-w-0 flex-1">
          <main id="conteudo">{children}</main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
