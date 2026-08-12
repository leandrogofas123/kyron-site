"use client";

import { useState, type ReactNode } from "react";

import { ModuloForm, type ModuloEdit } from "./ModuloForm";
import { AcoesStatus, BadgeStatus } from "./AcoesStatus";
import { BotoesReordenar } from "./BotoesReordenar";

export function ModuloBloco({
  modulo, trilhaId, podeSubir, podeDescer, onSubir, onDescer, onPublicar, onDespublicar, onArquivar, children,
}: {
  modulo: ModuloEdit & { status: string };
  trilhaId: number;
  podeSubir: boolean;
  podeDescer: boolean;
  onSubir: () => Promise<void>;
  onDescer: () => Promise<void>;
  onPublicar: () => Promise<void>;
  onDespublicar: () => Promise<void>;
  onArquivar: () => Promise<void>;
  children: ReactNode;
}) {
  const [editando, setEditando] = useState(false);

  return (
    <div className="rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite/60 p-fluid-sm">
      <div className="mb-fluid-sm flex flex-wrap items-center gap-fluid-sm">
        {editando ? (
          <div className="flex-1 space-y-fluid-2xs">
            <ModuloForm trilhaId={trilhaId} modulo={modulo} />
            <button type="button" onClick={() => setEditando(false)} className="text-fluid-2xs text-kyron-silver/60 hover:text-kyron-white">
              Cancelar edição
            </button>
          </div>
        ) : (
          <>
            <BotoesReordenar podeSubir={podeSubir} podeDescer={podeDescer} onSubir={onSubir} onDescer={onDescer} />
            <p className="flex-1 text-fluid-base font-medium text-kyron-white">{modulo.nome}</p>
            <BadgeStatus status={modulo.status} />
            <AcoesStatus
              status={modulo.status}
              onPublicar={onPublicar}
              onDespublicar={onDespublicar}
              onArquivar={onArquivar}
              confirmarArquivar="Arquivar este módulo? As aulas dele deixam de aparecer para o aluno."
            />
            <button type="button" onClick={() => setEditando(true)} className="text-fluid-2xs text-kyron-silver transition-colors hover:text-kyron-white">
              Editar
            </button>
          </>
        )}
      </div>

      <div className="space-y-fluid-2xs pl-fluid-sm">{children}</div>
    </div>
  );
}
