"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import {
  acaoAdicionarAparelho,
  acaoStatusAparelho,
} from "@/lib/erp/acoes-aparelho";

type Aparelho = {
  id: number;
  imei: string | null;
  serial: string | null;
  status: string;
  localizacao: string | null;
  cliente: { id: number; nome: string } | null;
};

const STATUS: Array<[string, string]> = [
  ["estoque", "Em estoque"],
  ["vendido", "Vendido"],
  ["assistencia", "Assistência"],
  ["devolvido", "Devolvido"],
  ["perdido", "Perdido/roubado"],
];

const rotulo = (s: string) => STATUS.find(([v]) => v === s)?.[1] ?? s;

const campo =
  "rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-graphite px-fluid-sm py-fluid-2xs text-fluid-2xs text-kyron-white focus:border-[var(--kyron-blue-line)] focus:outline-none";

export function GerenciarAparelhos({
  produtoId,
  aparelhos,
  podeEditar,
}: {
  produtoId: number;
  aparelhos: Aparelho[];
  podeEditar: boolean;
}) {
  const adicionar = acaoAdicionarAparelho.bind(null, produtoId);
  const [estado, formAction, pendente] = useActionState(adicionar, null);
  const ref = useRef<HTMLFormElement>(null);
  const [lista, setLista] = useState(aparelhos);

  useEffect(() => setLista(aparelhos), [aparelhos]);
  useEffect(() => {
    if (estado?.ok) ref.current?.reset();
  }, [estado?.ok]);

  function mudarStatus(id: number, status: string) {
    setLista((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    void acaoStatusAparelho(id, status, produtoId);
  }

  return (
    <div>
      <h2 className="kyron-label mb-fluid-sm text-fluid-2xs text-kyron-silver/70">
        Aparelhos · IMEI / Nº de série ({lista.length})
      </h2>

      {podeEditar && (
        <form
          ref={ref}
          action={formAction}
          className="mb-fluid-sm flex flex-wrap items-end gap-fluid-2xs rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-sm"
        >
          <label className="flex flex-col gap-1">
            <span className="kyron-label text-fluid-2xs text-kyron-silver/60">IMEI</span>
            <input name="imei" inputMode="numeric" placeholder="15 dígitos" className={campo} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="kyron-label text-fluid-2xs text-kyron-silver/60">Nº série</span>
            <input name="serial" placeholder="opcional" className={campo} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="kyron-label text-fluid-2xs text-kyron-silver/60">Local</span>
            <input name="localizacao" placeholder="gaveta/vitrine" className={campo} />
          </label>
          <button
            type="submit"
            disabled={pendente}
            className="kyron-label rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-2xs text-fluid-2xs text-white transition-all hover:-translate-y-px disabled:opacity-50"
          >
            {pendente ? "Salvando…" : "Adicionar"}
          </button>
          {estado?.erro && (
            <p role="alert" className="w-full text-fluid-2xs text-kyron-blue">
              {estado.erro}
            </p>
          )}
        </form>
      )}

      {lista.length === 0 ? (
        <p className="text-fluid-2xs text-kyron-silver/60">
          Nenhum aparelho cadastrado. Registre o IMEI/série de cada unidade para
          rastrear procedência e garantia.
        </p>
      ) : (
        <ul className="space-y-fluid-2xs">
          {lista.map((a) => (
            <li
              key={a.id}
              className="rounded-kyron-sm border border-[var(--kyron-hairline)] px-fluid-sm py-fluid-xs"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-mono text-fluid-2xs text-kyron-white">
                  {a.imei ?? a.serial}
                </span>
                {podeEditar ? (
                  <select
                    value={a.status}
                    onChange={(e) => mudarStatus(a.id, e.target.value)}
                    aria-label="Status do aparelho"
                    className="rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-black px-1.5 py-1 text-fluid-2xs text-kyron-silver"
                  >
                    {STATUS.map(([v, r]) => (
                      <option key={v} value={v}>
                        {r}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-fluid-2xs text-kyron-silver">{rotulo(a.status)}</span>
                )}
              </div>
              {(a.serial && a.imei) || a.localizacao || a.cliente ? (
                <p className="text-fluid-2xs text-kyron-silver/60">
                  {[a.serial && a.imei ? `Série ${a.serial}` : null, a.localizacao, a.cliente?.nome]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
