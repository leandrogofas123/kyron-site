"use client";

import { useState, type ReactNode } from "react";

import { Footer } from "./Footer";
import { Header } from "./Header";
import { SidebarDepartamentos } from "./SidebarDepartamentos";

/**
 * Casca da loja: coordena o cabeçalho e a barra lateral de Departamentos.
 *
 * A barra fica ACOPLADA ao layout no desktop (empurra o conteúdo e pode
 * permanecer aberta como apoio à navegação). Enquanto ela está aberta, a
 * barra de navegação do topo some — o comando fica só na lateral.
 * No celular, ela abre sobreposta, com fundo escurecido.
 */
export function ShellSite({ children }: { children: ReactNode }) {
  const [aberta, setAberta] = useState(false);

  return (
    <>
      <Header
        sidebarAberta={aberta}
        onAlternarSidebar={() => setAberta((v) => !v)}
      />

      <div className="flex">
        <SidebarDepartamentos aberta={aberta} onFechar={() => setAberta(false)} />

        <div className="min-w-0 flex-1">
          <main id="conteudo">{children}</main>
          <Footer />
        </div>
      </div>
    </>
  );
}
