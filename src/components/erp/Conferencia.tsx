"use client";

import { useState, useTransition } from "react";

import { acaoAplicarContagem } from "@/lib/erp/acoes-inventario";

type Item = {
  id: number;
  nome: string;
  sku: string | null;
  codigoInterno: string | null;
  quantidade: number;
};

export function Conferencia({ itens }: { itens: Item[] }) {
  const [saldos, setSaldos] = useState<Record<number, number>>(
    Object.fromEntries(itens.map((i) => [i.id, i.quantidade])),
  );
  const [contado, setContado] = useState<Record<number, string>>({});
  const [feito, setFeito] = useState<Record<number, boolean>>({});
  const [pendente, startTransition] = useTransition();
  const [busca, setBusca] = useState("");

  function aplicar(id: number) {
    const n = Number(contado[id]);
    if (!Number.isInteger(n) || n < 0) return;
    startTransition(async () => {
      const r = await acaoAplicarContagem(id, n);
      if (r?.ok) {
        setSaldos((p) => ({ ...p, [id]: r.saldo ?? n }));
        setFeito((p) => ({ ...p, [id]: true }));
      }
    });
  }

  const visiveis = busca.trim()
    ? itens.filter((i) =>
        `${i.nome} ${i.sku ?? ""} ${i.codigoInterno ?? ""}`
          .toLowerCase()
          .includes(busca.toLowerCase()),
      )
    : itens;

  return (
    <div>
      <input
        type="search"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Filtrar por nome, SKU ou código…"
        className="mb-fluid-sm w-full rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-graphite px-fluid-sm py-fluid-2xs text-fluid-2xs text-kyron-white focus:border-[var(--kyron-blue-line)] focus:outline-none"
      />

      <div className="kyron-scroll overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-fluid-2xs">
          <thead>
            <tr className="text-left text-kyron-silver/60">
              <th className="py-fluid-2xs pr-fluid-sm">Produto</th>
              <th className="px-fluid-sm text-right">Sistema</th>
              <th className="px-fluid-sm text-right">Contado</th>
              <th className="px-fluid-sm text-right">Diverg.</th>
              <th className="pl-fluid-sm" />
            </tr>
          </thead>
          <tbody>
            {visiveis.map((i) => {
              const saldo = saldos[i.id];
              const c = contado[i.id];
              const n = c === "" || c === undefined ? null : Number(c);
              const div = n != null && Number.isFinite(n) ? n - saldo : null;
              return (
                <tr key={i.id} className="border-t border-[var(--kyron-hairline)]">
                  <td className="py-fluid-2xs pr-fluid-sm text-kyron-white">
                    {i.nome}
                    {i.sku && (
                      <span className="text-kyron-silver/50"> · {i.sku}</span>
                    )}
                  </td>
                  <td className="px-fluid-sm text-right text-kyron-silver">{saldo}</td>
                  <td className="px-fluid-sm text-right">
                    <input
                      inputMode="numeric"
                      value={c ?? ""}
                      onChange={(e) =>
                        setContado((p) => ({ ...p, [i.id]: e.target.value }))
                      }
                      className="w-16 rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-black px-2 py-1 text-right text-kyron-white focus:border-[var(--kyron-blue-line)] focus:outline-none"
                    />
                  </td>
                  <td
                    className={`px-fluid-sm text-right ${
                      div == null
                        ? "text-kyron-silver/30"
                        : div === 0
                          ? "text-kyron-silver/50"
                          : "text-kyron-blue"
                    }`}
                  >
                    {div == null ? "—" : div > 0 ? `+${div}` : div}
                  </td>
                  <td className="pl-fluid-sm text-right">
                    {feito[i.id] ? (
                      <span className="text-kyron-silver/50">ok</span>
                    ) : (
                      <button
                        type="button"
                        disabled={pendente || div == null || div === 0}
                        onClick={() => aplicar(i.id)}
                        className="kyron-label rounded-kyron-sm border border-[var(--kyron-hairline-strong)] px-fluid-sm py-1 text-kyron-silver transition-colors hover:text-kyron-white disabled:opacity-30"
                      >
                        Ajustar
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
