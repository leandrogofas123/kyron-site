"use client";

import { useActionState, useState } from "react";

import { formatarPreco } from "@/lib/format";
import { acaoConfirmarNota } from "@/lib/erp/nfe/importar";

export type ItemConferencia = {
  id: number;
  descricao: string;
  ean: string | null;
  ncm: string | null;
  quantidade: number;
  valorUnitario: number;
  processado: boolean;
  produtoVinculadoNome: string | null;
  sugestoes: {
    produtoId: number;
    nome: string;
    quantidadeAtual: number;
    motivo: string;
    score: number;
  }[];
};

type Categoria = { id: number; nome: string; parentId: number | null };

const campoSel =
  "w-full rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-black px-2 py-1.5 text-fluid-2xs text-kyron-white focus:border-[var(--kyron-blue-line)] focus:outline-none";

export function ConferenciaNota({
  notaId,
  itens,
  categorias,
  finalizada,
}: {
  notaId: number;
  itens: ItemConferencia[];
  categorias: Categoria[];
  finalizada: boolean;
}) {
  const [estado, confirmar, confirmando] = useActionState(acaoConfirmarNota, null);

  // Decisão inicial por item: vincular à melhor sugestão forte, senão criar.
  const [acoes, setAcoes] = useState<Record<number, "criar" | "vincular" | "ignorar">>(
    () =>
      Object.fromEntries(
        itens.map((i) => [
          i.id,
          i.processado
            ? "ignorar"
            : i.sugestoes.some((s) => s.score >= 0.6)
              ? "vincular"
              : "criar",
        ]),
      ),
  );

  if (finalizada) {
    return (
      <div className="rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-md">
        <p className="text-fluid-sm text-kyron-white">
          Esta nota já foi finalizada — o estoque foi atualizado e o histórico
          registrado. Abaixo, o que cada item virou.
        </p>
        <ul className="mt-fluid-sm space-y-fluid-2xs">
          {itens.map((i) => (
            <li key={i.id} className="text-fluid-2xs text-kyron-silver">
              {i.quantidade}× {i.descricao} →{" "}
              <span className="text-kyron-white">
                {i.produtoVinculadoNome ?? "processado"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <form action={confirmar}>
      <input type="hidden" name="notaId" value={notaId} />

      <div className="space-y-fluid-sm">
        {itens.map((item) => {
          const acao = acoes[item.id];
          return (
            <div
              key={item.id}
              className="rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-fluid-sm">
                <div className="min-w-0">
                  <p className="text-fluid-sm font-semibold text-kyron-white">
                    {item.descricao}
                  </p>
                  <p className="text-fluid-2xs text-kyron-silver/60">
                    {item.quantidade} un. · {formatarPreco(item.valorUnitario)} cada
                    {item.ean ? ` · EAN ${item.ean}` : ""}
                    {item.ncm ? ` · NCM ${item.ncm}` : ""}
                  </p>
                </div>

                {/* Escolha da ação */}
                <div className="flex gap-1 rounded-kyron-sm border border-[var(--kyron-hairline)] p-0.5 text-fluid-2xs">
                  {(["criar", "vincular", "ignorar"] as const).map((op) => (
                    <button
                      key={op}
                      type="button"
                      onClick={() => setAcoes((a) => ({ ...a, [item.id]: op }))}
                      disabled={op === "vincular" && item.sugestoes.length === 0}
                      className={`kyron-label rounded-[3px] px-2 py-1 transition-colors disabled:opacity-30 ${
                        acao === op
                          ? "bg-kyron-blue text-white"
                          : "text-kyron-silver hover:text-kyron-white"
                      }`}
                    >
                      {op === "criar" ? "Criar novo" : op === "vincular" ? "Vincular" : "Ignorar"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Campo conforme a ação */}
              <input type="hidden" name={`acao-${item.id}`} value={acao} />

              {acao === "vincular" && (
                <div className="mt-fluid-xs">
                  <select
                    name={`produto-${item.id}`}
                    defaultValue={item.sugestoes[0]?.produtoId ?? ""}
                    className={campoSel}
                  >
                    {item.sugestoes.map((s) => (
                      <option key={s.produtoId} value={s.produtoId}>
                        {s.nome} — {s.motivo} (estoque {s.quantidadeAtual})
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-fluid-2xs text-kyron-silver/55">
                    Soma {item.quantidade} ao estoque e atualiza o custo.
                  </p>
                </div>
              )}

              {acao === "criar" && (
                <div className="mt-fluid-xs">
                  <select name={`categoria-${item.id}`} defaultValue="" className={campoSel}>
                    <option value="">Categoria do novo produto…</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.parentId ? "— " : ""}
                        {c.nome}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-fluid-2xs text-kyron-silver/55">
                    Nasce <strong>inativo</strong> com o custo da nota — defina o
                    preço de venda antes de publicar na loja.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {estado?.erro && (
        <p role="alert" className="mt-fluid-md text-fluid-sm text-kyron-blue">
          {estado.erro}
        </p>
      )}

      <button
        type="submit"
        disabled={confirmando}
        className="kyron-label mt-fluid-lg rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-sm text-fluid-xs text-white transition-all hover:-translate-y-px disabled:opacity-50"
      >
        {confirmando ? "Finalizando…" : "Finalizar entrada"}
      </button>
      <p className="mt-fluid-xs text-fluid-2xs text-kyron-silver/55">
        Ao finalizar, cada item vira uma entrada de estoque com histórico. Não
        cria produto duplicado — os semelhantes são sugeridos para vincular.
      </p>
    </form>
  );
}
