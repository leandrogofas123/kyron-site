"use client";

import { useActionState, useRef } from "react";

import { acaoSalvarConquista } from "@/lib/academy/acoes";

const campo =
  "w-full rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-black px-fluid-sm py-fluid-xs text-fluid-sm text-kyron-white focus:border-[var(--kyron-blue-line)] focus:outline-none";
const rotulo = "kyron-label mb-fluid-2xs block text-fluid-2xs text-kyron-silver/60";

const CRITERIOS = [
  ["primeira-aula", "Concluir N aulas (total)"],
  ["aulas-dia", "Concluir N aulas no mesmo dia"],
  ["streak", "N dias seguidos de estudo"],
  ["quiz-100", "Tirar 100% em um quiz"],
  ["trilha-completa", "Concluir N trilhas"],
] as const;

export type ConquistaEdit = {
  id: number; nome: string; descricao: string | null; icone: string | null;
  criterioTipo: string; criterioValor: number;
};

export function ConquistaForm({ conquista }: { conquista?: ConquistaEdit }) {
  const [estado, formAction, pendente] = useActionState(acaoSalvarConquista, null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (form) => { await formAction(form); if (!conquista) formRef.current?.reset(); }}
      className="space-y-fluid-xs rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-black/40 p-fluid-sm"
    >
      {conquista && <input type="hidden" name="id" value={conquista.id} />}
      <div className="grid grid-cols-1 gap-fluid-xs sm:grid-cols-2">
        <div>
          <label className={rotulo}>Nome *</label>
          <input name="nome" defaultValue={conquista?.nome} required placeholder="Ex.: Sem Ruído" className={campo} />
        </div>
        <div>
          <label className={rotulo}>Ícone (opcional, emoji ou palavra)</label>
          <input name="icone" defaultValue={conquista?.icone ?? ""} placeholder="🔥" className={campo} />
        </div>
      </div>
      <div>
        <label className={rotulo}>Descrição</label>
        <input name="descricao" defaultValue={conquista?.descricao ?? ""} placeholder="Como o aluno ganha isso" className={campo} />
      </div>
      <div className="grid grid-cols-1 gap-fluid-xs sm:grid-cols-2">
        <div>
          <label className={rotulo}>Critério</label>
          <select name="criterioTipo" defaultValue={conquista?.criterioTipo ?? "primeira-aula"} className={campo}>
            {CRITERIOS.map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
          </select>
        </div>
        <div>
          <label className={rotulo}>Valor do critério (N)</label>
          <input name="criterioValor" type="number" min={0} defaultValue={conquista?.criterioValor ?? 1} className={campo} />
        </div>
      </div>
      {estado?.erro && <p role="alert" className="text-fluid-2xs text-[var(--kyron-amber,#d9902f)]">{estado.erro}</p>}
      <button type="submit" disabled={pendente} className="kyron-label rounded-kyron-sm bg-kyron-blue px-fluid-sm py-fluid-xs text-fluid-2xs text-white disabled:opacity-50">
        {pendente ? "Salvando…" : conquista ? "Salvar alterações" : "Criar conquista"}
      </button>
    </form>
  );
}
