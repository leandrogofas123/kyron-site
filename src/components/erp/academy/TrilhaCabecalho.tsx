"use client";

import { useState } from "react";

import { TrilhaForm, type TrilhaEdit } from "./TrilhaForm";
import { AcoesStatus, BadgeStatus } from "./AcoesStatus";

export function TrilhaCabecalho({
  trilha, onPublicar, onDespublicar, onArquivar,
}: {
  trilha: TrilhaEdit & { status: string };
  onPublicar: () => Promise<void>;
  onDespublicar: () => Promise<void>;
  onArquivar: () => Promise<void>;
}) {
  const [editando, setEditando] = useState(false);

  if (editando) {
    return (
      <div className="mb-fluid-lg space-y-fluid-2xs rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-md">
        <TrilhaForm trilha={trilha} />
        <button type="button" onClick={() => setEditando(false)} className="text-fluid-2xs text-kyron-silver/60 hover:text-kyron-white">
          Cancelar edição
        </button>
      </div>
    );
  }

  return (
    <div className="mb-fluid-lg flex flex-wrap items-center gap-fluid-sm">
      <div className="flex-1">
        <p className="kyron-label text-fluid-xs text-kyron-blue">{trilha.sigla ?? "—"} · {trilha.nivel}</p>
        <h1 className="kyron-display text-fluid-xl text-kyron-white">{trilha.nome}</h1>
      </div>
      <BadgeStatus status={trilha.status} />
      <AcoesStatus
        status={trilha.status}
        onPublicar={onPublicar}
        onDespublicar={onDespublicar}
        onArquivar={onArquivar}
        confirmarArquivar="Arquivar esta trilha? Ela e todo o conteúdo somem do aluno, mas nada é apagado."
      />
      <button type="button" onClick={() => setEditando(true)} className="text-fluid-2xs text-kyron-silver transition-colors hover:text-kyron-white">
        Editar
      </button>
    </div>
  );
}
