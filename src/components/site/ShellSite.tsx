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

  return (
    <>
      <Header
        sidebarAberta={aberta}
        onAlternarSidebar={() => setAberta((v) => { gravar(!v); return !v; })}
      />

      <div className="flex">
        <SidebarDepartamentos aberta={aberta} onFechar={() => { gravar(false); setAberta(false); }} />

        <div className="min-w-0 flex-1">
          <main id="conteudo">{children}</main>
          <Footer />
        </div>
      </div>
    </>
  );
}
