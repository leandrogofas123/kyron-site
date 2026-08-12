"use client";

import { useTransition } from "react";

export function BotaoExcluirConquista({
  bloqueado, onExcluir,
}: { bloqueado: boolean; onExcluir: () => Promise<void> }) {
  const [pend, start] = useTransition();

  if (bloqueado) {
    return (
      <span title="Já concedida a algum aluno — não pode ser excluída" className="text-fluid-2xs text-kyron-silver/30">
        Excluir
      </span>
    );
  }

  return (
    <button
      type="button" disabled={pend}
      onClick={() => { if (confirm("Excluir esta conquista? Ninguém a ganhou ainda, é seguro.")) start(onExcluir); }}
      className="text-fluid-2xs text-kyron-silver/60 transition-colors hover:text-[var(--kyron-amber,#d9902f)] disabled:opacity-50"
    >
      Excluir
    </button>
  );
}
