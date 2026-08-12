"use client";

import { useActionState } from "react";

import { acaoSalvarTrilha } from "@/lib/academy/acoes";

const campo =
  "w-full rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-graphite px-fluid-sm py-fluid-xs text-fluid-base text-kyron-white focus:border-[var(--kyron-blue-line)] focus:outline-none";
const rotulo = "kyron-label mb-fluid-2xs block text-fluid-2xs text-kyron-silver/70";

export type TrilhaEdit = {
  id: number;
  nome: string;
  sigla: string | null;
  nivel: string;
  descricao: string | null;
  corHex: string | null;
  regiaoMapa: string | null;
  ordem: number;
};

export function TrilhaForm({ trilha }: { trilha?: TrilhaEdit }) {
  const [estado, formAction, pendente] = useActionState(acaoSalvarTrilha, null);

  return (
    <form action={formAction} className="space-y-fluid-md">
      {trilha && <input type="hidden" name="id" value={trilha.id} />}

      <div className="grid grid-cols-1 gap-fluid-sm sm:grid-cols-[1fr_7rem_7rem]">
        <div>
          <label htmlFor="t-nome" className={rotulo}>Nome da trilha *</label>
          <input id="t-nome" name="nome" defaultValue={trilha?.nome} required placeholder="Ex.: Vendas e Negociação" className={campo} />
        </div>
        <div>
          <label htmlFor="t-sigla" className={rotulo}>Sigla</label>
          <input id="t-sigla" name="sigla" defaultValue={trilha?.sigla ?? ""} maxLength={4} placeholder="VND" className={campo} />
        </div>
        <div>
          <label htmlFor="t-nivel" className={rotulo}>Nível</label>
          <select id="t-nivel" name="nivel" defaultValue={trilha?.nivel ?? "N1"} className={campo}>
            <option value="N1">N1</option>
            <option value="N2">N2</option>
            <option value="N3">N3</option>
            <option value="N4">N4</option>
            <option value="N5">N5</option>
            <option value="N6">N6</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="t-descricao" className={rotulo}>Descrição</label>
        <textarea id="t-descricao" name="descricao" rows={2} defaultValue={trilha?.descricao ?? ""} placeholder="Uma linha que resume a trilha" className={`${campo} resize-y`} />
      </div>

      <div className="grid grid-cols-1 gap-fluid-sm sm:grid-cols-3">
        <div>
          <label htmlFor="t-cor" className={rotulo}>Cor (hex)</label>
          <input id="t-cor" name="corHex" defaultValue={trilha?.corHex ?? "#1E6BFF"} className={campo} />
        </div>
        <div>
          <label htmlFor="t-regiao" className={rotulo}>Região do mapa</label>
          <input id="t-regiao" name="regiaoMapa" defaultValue={trilha?.regiaoMapa ?? ""} placeholder="vnd" className={campo} />
        </div>
        <div>
          <label htmlFor="t-ordem" className={rotulo}>Ordem</label>
          <input id="t-ordem" name="ordem" type="number" defaultValue={trilha?.ordem ?? 0} className={campo} />
        </div>
      </div>

      {estado?.erro && <p role="alert" className="text-fluid-sm text-[var(--kyron-amber,#d9902f)]">{estado.erro}</p>}

      <button type="submit" disabled={pendente} className="kyron-label rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-sm text-fluid-xs text-white transition-all duration-300 hover:-translate-y-px disabled:opacity-50">
        {pendente ? "Salvando…" : trilha ? "Salvar alterações" : "Criar trilha"}
      </button>
    </form>
  );
}
