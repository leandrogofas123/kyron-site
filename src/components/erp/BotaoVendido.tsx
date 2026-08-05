"use client";

import { useTransition } from "react";

import { acaoMarcarVendido } from "@/lib/erp/seminovos-actions";

/** Botão de 1 clique: marcar/desmarcar seminovo como vendido. */
export function BotaoVendido({ produtoId, vendido }: { produtoId: number; vendido: boolean }) {
  const [pendente, iniciar] = useTransition();

  return (
    <button
      type="button"
      disabled={pendente}
      onClick={() => iniciar(() => acaoMarcarVendido(produtoId, !vendido))}
      className={`kyron-label rounded-full px-fluid-sm py-1 text-fluid-2xs transition-colors disabled:opacity-50 ${
        vendido
          ? "border border-[var(--kyron-hairline-strong)] text-kyron-silver hover:text-kyron-white"
          : "bg-kyron-blue text-white hover:-translate-y-px"
      }`}
    >
      {vendido ? "Reativar" : "Marcar vendido"}
    </button>
  );
}
