"use client";

import { useTransition } from "react";

import { acaoAlternarAulaPublicado, acaoExcluirAula } from "@/lib/erp/aulas-actions";

export function AcoesAula({ id, publicado }: { id: number; publicado: boolean }) {
  const [pend, start] = useTransition();

  return (
    <div className="flex shrink-0 items-center gap-fluid-sm">
      <button
        type="button"
        disabled={pend}
        onClick={() => start(() => acaoAlternarAulaPublicado(id, !publicado))}
        className="text-fluid-2xs text-kyron-silver transition-colors hover:text-kyron-white disabled:opacity-50"
      >
        {publicado ? "Despublicar" : "Publicar"}
      </button>
      <button
        type="button"
        disabled={pend}
        onClick={() => {
          if (confirm("Excluir esta aula/post? Não dá para desfazer.")) {
            start(() => acaoExcluirAula(id));
          }
        }}
        className="text-fluid-2xs text-kyron-silver/60 transition-colors hover:text-[var(--kyron-amber,#d9902f)] disabled:opacity-50"
      >
        Excluir
      </button>
    </div>
  );
}
