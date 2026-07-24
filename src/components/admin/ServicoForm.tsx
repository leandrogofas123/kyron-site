"use client";

import { useActionState } from "react";

import { acaoSalvarServico } from "@/lib/admin-actions";

const campo =
  "w-full rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-graphite px-fluid-sm py-fluid-xs text-fluid-base text-kyron-white focus:border-[var(--kyron-blue-line)] focus:outline-none";
const rotulo = "kyron-label mb-fluid-2xs block text-fluid-2xs text-kyron-silver/70";

export type ServicoEdit = {
  id: number;
  nome: string;
  descricao: string | null;
  precoAPartirDe: number | null;
  atendeEmDomicilio: boolean;
  tempoMedio: string | null;
  ativo: boolean;
};

export function ServicoForm({ servico }: { servico?: ServicoEdit }) {
  const [estado, formAction, pendente] = useActionState(acaoSalvarServico, null);

  return (
    <form action={formAction} className="space-y-fluid-md">
      {servico && <input type="hidden" name="id" value={servico.id} />}

      <div>
        <label htmlFor="s-nome" className={rotulo}>Nome do serviço *</label>
        <input id="s-nome" name="nome" defaultValue={servico?.nome} required className={campo} />
      </div>

      <div>
        <label htmlFor="s-desc" className={rotulo}>Descrição</label>
        <textarea id="s-desc" name="descricao" rows={3} defaultValue={servico?.descricao ?? ""} className={`${campo} resize-y`} />
      </div>

      <div className="grid-fluida-2 [--gap:var(--spacing-fluid-md)]">
        <div>
          <label htmlFor="s-preco" className={rotulo}>Preço a partir de (R$)</label>
          <input
            id="s-preco"
            name="precoAPartirDe"
            inputMode="decimal"
            placeholder="deixe vazio p/ 'sob orçamento'"
            defaultValue={
              servico?.precoAPartirDe != null
                ? (servico.precoAPartirDe / 100).toFixed(2).replace(".", ",")
                : ""
            }
            className={campo}
          />
        </div>
        <div>
          <label htmlFor="s-tempo" className={rotulo}>Tempo médio</label>
          <input id="s-tempo" name="tempoMedio" defaultValue={servico?.tempoMedio ?? ""} placeholder="1 a 3 horas" className={campo} />
        </div>
      </div>

      <div className="flex flex-wrap gap-fluid-md">
        <label className="flex items-center gap-fluid-xs text-fluid-sm text-kyron-silver">
          <input type="checkbox" name="atendeEmDomicilio" defaultChecked={servico?.atendeEmDomicilio} className="h-4 w-4 accent-[#1e6bff]" />
          Atende em domicílio
        </label>
        <label className="flex items-center gap-fluid-xs text-fluid-sm text-kyron-silver">
          <input type="checkbox" name="ativo" defaultChecked={servico ? servico.ativo : true} value="on" className="h-4 w-4 accent-[#1e6bff]" />
          Ativo
        </label>
      </div>

      {estado?.erro && <p role="alert" className="text-fluid-sm text-kyron-blue">{estado.erro}</p>}

      <button type="submit" disabled={pendente} className="kyron-label rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-sm text-fluid-xs text-white transition-all duration-300 hover:-translate-y-px disabled:opacity-50">
        {pendente ? "Salvando…" : servico ? "Salvar alterações" : "Adicionar serviço"}
      </button>
    </form>
  );
}
