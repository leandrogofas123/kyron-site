"use client";

import { useActionState } from "react";

import { acaoDefinirPreRequisitos } from "@/lib/academy/acoes";

export function PreRequisitoForm({
  aulaId, outrasAulas, atuais,
}: {
  aulaId: number;
  outrasAulas: Array<{ id: number; titulo: string }>;
  atuais: number[];
}) {
  const [estado, formAction, pendente] = useActionState(acaoDefinirPreRequisitos, null);

  if (outrasAulas.length === 0) {
    return <p className="text-fluid-2xs text-kyron-silver/50">Não há outras aulas nesta trilha ainda para usar como pré-requisito.</p>;
  }

  return (
    <form action={formAction} className="space-y-fluid-xs">
      <input type="hidden" name="aulaId" value={aulaId} />
      <p className="text-fluid-2xs text-kyron-silver/60">Marque as aulas que precisam ser concluídas antes desta liberar.</p>
      <div className="max-h-48 space-y-fluid-2xs overflow-y-auto rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-black/40 p-fluid-sm">
        {outrasAulas.map((a) => (
          <label key={a.id} className="flex items-center gap-fluid-2xs text-fluid-2xs text-kyron-silver">
            <input type="checkbox" name="dependeDe" value={a.id} defaultChecked={atuais.includes(a.id)} className="h-4 w-4 accent-kyron-blue" />
            {a.titulo}
          </label>
        ))}
      </div>
      {estado?.erro && <p role="alert" className="text-fluid-2xs text-[var(--kyron-amber,#d9902f)]">{estado.erro}</p>}
      {estado?.ok && <p className="text-fluid-2xs text-emerald-400">Pré-requisitos salvos.</p>}
      <button type="submit" disabled={pendente}
        className="kyron-label rounded-kyron-sm bg-kyron-blue px-fluid-sm py-fluid-xs text-fluid-2xs text-white disabled:opacity-50">
        {pendente ? "Salvando…" : "Salvar pré-requisitos"}
      </button>
    </form>
  );
}
