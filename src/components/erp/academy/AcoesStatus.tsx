"use client";

import { useTransition } from "react";

/** Badge de status de publicação — mesma leitura visual em Trilha/Módulo/Aula. */
export function BadgeStatus({ status }: { status: string }) {
  const mapa: Record<string, { texto: string; cls: string }> = {
    RASCUNHO: { texto: "Rascunho", cls: "text-kyron-silver/60 border-[var(--kyron-hairline)]" },
    REVISAO: { texto: "Em revisão", cls: "text-amber-400 border-amber-400/30" },
    PUBLICADO: { texto: "Publicado", cls: "text-emerald-400 border-emerald-400/30" },
    ARQUIVADO: { texto: "Arquivado", cls: "text-kyron-silver/40 border-[var(--kyron-hairline)]" },
  };
  const s = mapa[status] ?? mapa.RASCUNHO;
  return (
    <span className={`kyron-label rounded-kyron-sm border px-fluid-2xs py-[2px] text-fluid-2xs ${s.cls}`}>
      {s.texto}
    </span>
  );
}

/** Botões de publicar/despublicar/arquivar. Genérico — recebe as 3 actions já bindadas ao id. */
export function AcoesStatus({
  status,
  onPublicar,
  onDespublicar,
  onArquivar,
  confirmarArquivar = "Arquivar? O conteúdo some do aluno mas continua no banco (progresso/certificados preservados).",
}: {
  status: string;
  onPublicar: () => Promise<void>;
  onDespublicar: () => Promise<void>;
  onArquivar: () => Promise<void>;
  confirmarArquivar?: string;
}) {
  const [pend, start] = useTransition();

  return (
    <div className="flex shrink-0 items-center gap-fluid-sm">
      {status !== "PUBLICADO" && status !== "ARQUIVADO" && (
        <button type="button" disabled={pend} onClick={() => start(onPublicar)}
          className="text-fluid-2xs text-kyron-blue transition-colors hover:text-kyron-white disabled:opacity-50">
          Publicar
        </button>
      )}
      {status === "PUBLICADO" && (
        <button type="button" disabled={pend} onClick={() => start(onDespublicar)}
          className="text-fluid-2xs text-kyron-silver transition-colors hover:text-kyron-white disabled:opacity-50">
          Despublicar
        </button>
      )}
      {status !== "ARQUIVADO" && (
        <button type="button" disabled={pend}
          onClick={() => { if (confirm(confirmarArquivar)) start(onArquivar); }}
          className="text-fluid-2xs text-kyron-silver/60 transition-colors hover:text-[var(--kyron-amber,#d9902f)] disabled:opacity-50">
          Arquivar
        </button>
      )}
    </div>
  );
}
