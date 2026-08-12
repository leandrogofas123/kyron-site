"use client";

import { Printer } from "lucide-react";

/** Abre o diálogo de impressão do navegador — "Salvar como PDF" já cobre o pedido de certificado baixável. */
export function BotaoImprimirCertificado() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print mt-fluid-md inline-flex items-center gap-fluid-2xs rounded-kyron-sm border border-kyron-blue/40 bg-kyron-blue/10 px-fluid-sm py-fluid-xs text-fluid-xs text-kyron-blue transition-colors hover:bg-kyron-blue/20"
    >
      <Printer size={15} /> Baixar / imprimir certificado
    </button>
  );
}
