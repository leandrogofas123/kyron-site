"use client";

import { useActionState } from "react";

import { acaoMovimentar } from "@/lib/erp/acoes-estoque";
import { TIPOS_MOVIMENTACAO } from "@/lib/erp/estoque-tipos";

const campo =
  "w-full rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-black px-fluid-sm py-fluid-xs text-fluid-sm text-kyron-white focus:border-[var(--kyron-blue-line)] focus:outline-none";
const rotulo = "kyron-label mb-fluid-2xs block text-fluid-2xs text-kyron-silver/70";

export function FormMovimentar({
  produtos,
  clientes = [],
}: {
  produtos: { id: number; nome: string; sku: string | null; quantidade: number }[];
  clientes?: { id: number; nome: string; telefone: string | null }[];
}) {
  const [estado, mover, movendo] = useActionState(acaoMovimentar, null);

  return (
    <form action={mover} className="space-y-fluid-sm">
      <div>
        <label htmlFor="produtoId" className={rotulo}>
          Produto *
        </label>
        <select id="produtoId" name="produtoId" required className={campo}>
          <option value="">Selecione…</option>
          {produtos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
              {p.sku ? ` (${p.sku})` : ""} — {p.quantidade} em estoque
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-fluid-sm sm:grid-cols-2">
        <div>
          <label htmlFor="tipo" className={rotulo}>
            Tipo *
          </label>
          <select id="tipo" name="tipo" defaultValue="entrada" required className={campo}>
            {TIPOS_MOVIMENTACAO.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="quantidade" className={rotulo}>
            Quantidade *
          </label>
          <input
            id="quantidade"
            name="quantidade"
            inputMode="numeric"
            defaultValue="1"
            required
            className={campo}
          />
          <p className="mt-1 text-fluid-2xs text-kyron-silver/55">
            Em “Ajuste de inventário”, informe o saldo final correto.
          </p>
        </div>
      </div>

      {clientes.length > 0 && (
        <div>
          <label htmlFor="clienteId" className={rotulo}>
            Cliente
          </label>
          <select id="clienteId" name="clienteId" defaultValue="" className={campo}>
            <option value="">—</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
                {c.telefone ? ` · ${c.telefone}` : ""}
              </option>
            ))}
          </select>
          <p className="mt-1 text-fluid-2xs text-kyron-silver/55">
            Em vendas, vincular o cliente monta o histórico e o controle de
            garantia dele.
          </p>
        </div>
      )}

      <div className="grid gap-fluid-sm sm:grid-cols-2">
        <div>
          <label htmlFor="motivo" className={rotulo}>
            Motivo
          </label>
          <input id="motivo" name="motivo" className={campo} placeholder="Compra, venda balcão…" />
        </div>
        <div>
          <label htmlFor="documento" className={rotulo}>
            Documento
          </label>
          <input id="documento" name="documento" className={campo} placeholder="NF, OS, pedido" />
        </div>
      </div>

      <div>
        <label htmlFor="observacao" className={rotulo}>
          Observação
        </label>
        <textarea id="observacao" name="observacao" rows={2} className={`${campo} resize-y`} />
      </div>

      {estado?.erro && (
        <p role="alert" className="text-fluid-sm text-kyron-blue">
          {estado.erro}
        </p>
      )}
      {estado?.ok && (
        <p className="text-fluid-sm text-kyron-silver">Movimentação registrada.</p>
      )}

      <button
        type="submit"
        disabled={movendo}
        className="kyron-label rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-sm text-fluid-xs text-white transition-all hover:-translate-y-px disabled:opacity-50"
      >
        {movendo ? "Registrando…" : "Registrar movimentação"}
      </button>
    </form>
  );
}
