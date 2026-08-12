"use client";

import { useState } from "react";
import { Clock3, FileText, HelpCircle, Lock, PlayCircle, Unlock } from "lucide-react";

import { AulaAcademyForm, type AulaAcademyEdit } from "./AulaAcademyForm";
import { AcoesStatus, BadgeStatus } from "./AcoesStatus";

const ICONE_TIPO: Record<string, React.ElementType> = {
  VIDEO: PlayCircle, TEXTO: FileText, QUIZ: HelpCircle, PDF: FileText,
};

export function AulaLinha({
  aula, trilhaId, moduloId, onPublicar, onDespublicar, onArquivar,
}: {
  aula: AulaAcademyEdit & { status: string };
  trilhaId: number;
  moduloId: number;
  onPublicar: () => Promise<void>;
  onDespublicar: () => Promise<void>;
  onArquivar: () => Promise<void>;
}) {
  const [editando, setEditando] = useState(false);
  const Icone = ICONE_TIPO[aula.tipo] ?? FileText;

  if (editando) {
    return (
      <div className="space-y-fluid-2xs">
        <AulaAcademyForm trilhaId={trilhaId} moduloId={moduloId} aula={aula} />
        <button type="button" onClick={() => setEditando(false)} className="text-fluid-2xs text-kyron-silver/60 hover:text-kyron-white">
          Cancelar edição
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-fluid-sm rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-black/30 px-fluid-sm py-fluid-xs">
      <Icone size={16} className="shrink-0 text-kyron-blue" />
      <div className="min-w-[9rem] flex-1">
        <p className="text-fluid-sm text-kyron-white">{aula.titulo}</p>
        <p className="flex items-center gap-fluid-2xs text-fluid-2xs text-kyron-silver/50">
          <Clock3 size={11} /> {aula.duracaoMin} min · {aula.xp} XP ·{" "}
          {aula.restrita ? <><Lock size={11} className="inline" /> restrita</> : <><Unlock size={11} className="inline" /> aberta</>}
        </p>
      </div>
      <BadgeStatus status={aula.status} />
      <AcoesStatus
        status={aula.status}
        onPublicar={onPublicar}
        onDespublicar={onDespublicar}
        onArquivar={onArquivar}
        confirmarArquivar="Arquivar esta aula? Some do aluno, mas o progresso de quem já assistiu é preservado."
      />
      <button type="button" onClick={() => setEditando(true)} className="text-fluid-2xs text-kyron-silver transition-colors hover:text-kyron-white">
        Editar
      </button>
    </div>
  );
}
