"use client";

import Link from "next/link";
import { useTransition } from "react";

import {
  acaoAlternarAtivo,
  acaoExcluirProduto,
  acaoMarcarVendido,
} from "@/lib/admin-actions";

/** Ações de um produto na listagem: editar, ativar/desativar, excluir. */
export function AcoesProduto({
  id,
  ativo,
}: {
  id: number;
  ativo: boolean;
}) {
  const [pendente, iniciar] = useTransition();

  return (
    <div className="flex items-center gap-fluid-sm text-fluid-2xs">
      <Link href={`/admin/produtos/${id}/editar`} className="text-kyron-blue hover:underline">
        Editar
      </Link>
      <button
        type="button"
        disabled={pendente}
        onClick={() => iniciar(() => acaoAlternarAtivo(id, !ativo))}
        className="text-kyron-silver hover:text-kyron-white disabled:opacity-50"
      >
        {ativo ? "Desativar" : "Ativar"}
      </button>
      <button
        type="button"
        disabled={pendente}
        onClick={() => {
          if (confirm("Excluir este produto? Não dá para desfazer.")) {
            iniciar(() => acaoExcluirProduto(id));
          }
        }}
        className="text-kyron-silver/60 hover:text-kyron-blue disabled:opacity-50"
      >
        Excluir
      </button>
    </div>
  );
}

/** Botão de 1 clique: marcar/desmarcar seminovo como vendido. */
export function BotaoVendido({
  produtoId,
  vendido,
}: {
  produtoId: number;
  vendido: boolean;
}) {
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
