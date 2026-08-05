"use client";

import { useTransition } from "react";

import { acaoAprovarAluno, acaoExcluirAluno } from "@/lib/erp/alunos-actions";

export function AcoesAluno({ id, aprovado }: { id: number; aprovado: boolean }) {
  const [pend, start] = useTransition();

  return (
    <div className="flex shrink-0 items-center gap-fluid-sm">
      <button
        type="button"
        disabled={pend}
        onClick={() => start(() => acaoAprovarAluno(id, !aprovado))}
        className={
          aprovado
            ? "text-fluid-2xs text-kyron-silver transition-colors hover:text-kyron-white disabled:opacity-50"
            : "kyron-label rounded-kyron-sm bg-kyron-blue px-fluid-sm py-1 text-fluid-2xs text-white transition-all hover:-translate-y-px disabled:opacity-50"
        }
      >
        {aprovado ? "Revogar" : "Aprovar"}
      </button>
      <button
        type="button"
        disabled={pend}
        onClick={() => {
          if (confirm("Excluir este aluno? Não dá para desfazer.")) {
            start(() => acaoExcluirAluno(id));
          }
        }}
        className="text-fluid-2xs text-kyron-silver/60 transition-colors hover:text-[var(--kyron-amber,#d9902f)] disabled:opacity-50"
      >
        Excluir
      </button>
    </div>
  );
}
