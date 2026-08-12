"use client";

import { useActionState, useState } from "react";

import { acaoSalvarModulo } from "@/lib/academy/acoes";

const campo =
  "w-full rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-black px-fluid-sm py-fluid-xs text-fluid-sm text-kyron-white focus:border-[var(--kyron-blue-line)] focus:outline-none";

export type ModuloEdit = { id: number; nome: string; ordem: number };

export function ModuloForm({
  trilhaId, modulo,
}: { trilhaId: number; modulo?: ModuloEdit }) {
  const [estado, formAction, pendente] = useActionState(acaoSalvarModulo, null);
  const [nome, setNome] = useState(modulo?.nome ?? "");

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-fluid-xs">
      <input type="hidden" name="trilhaId" value={trilhaId} />
      {modulo && <input type="hidden" name="id" value={modulo.id} />}
      <div className="min-w-[12rem] flex-1">
        <input
          name="nome" value={nome} onChange={(e) => setNome(e.target.value)}
          required placeholder="Nome do módulo" className={campo}
        />
      </div>
      <input name="ordem" type="number" defaultValue={modulo?.ordem ?? 0} className={`${campo} w-20`} />
      <button type="submit" disabled={pendente}
        className="kyron-label rounded-kyron-sm bg-kyron-blue px-fluid-sm py-fluid-xs text-fluid-2xs text-white disabled:opacity-50">
        {pendente ? "Salvando…" : modulo ? "Salvar" : "Adicionar módulo"}
      </button>
      {estado?.erro && <p role="alert" className="w-full text-fluid-2xs text-[var(--kyron-amber,#d9902f)]">{estado.erro}</p>}
    </form>
  );
}
