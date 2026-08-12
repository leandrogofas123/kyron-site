"use client";

import { useTransition } from "react";

export function BotaoArquivarMaterial({ onArquivar }: { onArquivar: () => Promise<void> }) {
  const [pend, start] = useTransition();
  return (
    <button
      type="button" disabled={pend}
      onClick={() => { if (confirm("Arquivar este material? Ele some da Biblioteca do aluno.")) start(onArquivar); }}
      className="text-fluid-2xs text-kyron-silver/60 transition-colors hover:text-[var(--kyron-amber,#d9902f)] disabled:opacity-50"
    >
      Arquivar
    </button>
  );
}
