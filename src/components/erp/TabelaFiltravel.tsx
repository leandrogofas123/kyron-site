"use client";

import { useMemo, useState, type ReactNode } from "react";

/**
 * Tabela filtrável reutilizável (estilo Excel/Sheets), 100% client-side sobre os
 * dados já carregados. Cada coluna declara seu tipo de filtro. Reutilizada por
 * Vendas, Relatórios e listagens de cadastro — sem duplicar lógica de
 * ordenação/filtro em cada tela.
 */
export type Coluna<T> = {
  chave: string;
  titulo: string;
  tipo: "texto" | "data" | "valor" | "acao";
  /** Valor bruto para ordenar/filtrar (string, número em centavos, ou ISO date). */
  valor?: (linha: T) => string | number;
  /** Conteúdo renderizado na célula (default: o valor). */
  render?: (linha: T) => ReactNode;
  alinhar?: "esq" | "dir";
};

const brl = (c: number) =>
  "R$ " + (c / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
const dataBR = (iso: string) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" }).format(new Date(iso));

type Filtro = { texto?: string; de?: string; ate?: string; min?: string; max?: string };
const inp =
  "w-full rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-graphite px-1.5 py-1 text-fluid-2xs text-kyron-white focus:border-[var(--kyron-blue-line)] focus:outline-none";

export function TabelaFiltravel<T>({
  colunas,
  dados,
  vazio = "Nada encontrado.",
}: {
  colunas: Coluna<T>[];
  dados: T[];
  vazio?: string;
}) {
  const [q, setQ] = useState("");
  const [ordem, setOrdem] = useState<{ chave: string; dir: 1 | -1 } | null>(null);
  const [filtros, setFiltros] = useState<Record<string, Filtro>>({});

  const setF = (chave: string, patch: Filtro) =>
    setFiltros((p) => ({ ...p, [chave]: { ...p[chave], ...patch } }));

  const filtradas = useMemo(() => {
    const termo = q.trim().toLowerCase();
    let linhas = dados.filter((l) => {
      if (termo) {
        const alvo = colunas.map((c) => String(c.valor?.(l) ?? "")).join(" ").toLowerCase();
        if (!alvo.includes(termo)) return false;
      }
      for (const c of colunas) {
        const f = filtros[c.chave];
        if (!f || c.tipo === "acao" || !c.valor) continue;
        const v = c.valor(l);
        if (c.tipo === "texto" && f.texto && !String(v).toLowerCase().includes(f.texto.toLowerCase())) return false;
        if (c.tipo === "valor") {
          const n = Number(v);
          if (f.min && n < Number(f.min.replace(",", ".")) * 100) return false;
          if (f.max && n > Number(f.max.replace(",", ".")) * 100) return false;
        }
        if (c.tipo === "data") {
          const d = new Date(String(v)).getTime();
          if (f.de && d < new Date(f.de).getTime()) return false;
          if (f.ate && d > new Date(f.ate).getTime() + 864e5 - 1) return false;
        }
      }
      return true;
    });
    if (ordem) {
      const col = colunas.find((c) => c.chave === ordem.chave);
      if (col?.valor) {
        linhas = [...linhas].sort((a, b) => {
          const va = col.valor!(a), vb = col.valor!(b);
          return va < vb ? -ordem.dir : va > vb ? ordem.dir : 0;
        });
      }
    }
    return linhas;
  }, [dados, colunas, q, filtros, ordem]);

  const alternarOrdem = (chave: string) =>
    setOrdem((o) => (o?.chave !== chave ? { chave, dir: 1 } : o.dir === 1 ? { chave, dir: -1 } : null));

  return (
    <div>
      <div className="mb-fluid-sm flex items-center justify-between gap-fluid-sm">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar em tudo…"
          className="w-full max-w-[24rem] rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-graphite px-fluid-sm py-fluid-2xs text-fluid-sm text-kyron-white focus:border-[var(--kyron-blue-line)] focus:outline-none"
        />
        <span className="shrink-0 text-fluid-2xs text-kyron-silver/60">
          {filtradas.length} de {dados.length}
        </span>
      </div>

      <div className="kyron-scroll overflow-x-auto rounded-kyron-md border border-[var(--kyron-hairline)]">
        <table className="w-full min-w-[44rem] border-collapse text-fluid-2xs">
          <thead>
            <tr className="border-b border-[var(--kyron-hairline)] bg-kyron-graphite">
              {colunas.map((c) => (
                <th key={c.chave} className={`px-fluid-sm py-fluid-2xs ${c.alinhar === "dir" ? "text-right" : "text-left"}`}>
                  <button
                    type="button"
                    onClick={() => c.tipo !== "acao" && alternarOrdem(c.chave)}
                    className={`kyron-label inline-flex items-center gap-1 text-fluid-2xs text-kyron-silver/70 ${c.tipo !== "acao" ? "hover:text-kyron-white" : "cursor-default"}`}
                  >
                    {c.titulo}
                    {ordem?.chave === c.chave && <span className="text-kyron-blue">{ordem.dir === 1 ? "▲" : "▼"}</span>}
                  </button>
                </th>
              ))}
            </tr>
            <tr className="border-b border-[var(--kyron-hairline)]">
              {colunas.map((c) => (
                <th key={c.chave} className="px-fluid-sm py-fluid-2xs align-top">
                  {c.tipo === "texto" && (
                    <input className={inp} placeholder="filtrar…" value={filtros[c.chave]?.texto ?? ""} onChange={(e) => setF(c.chave, { texto: e.target.value })} />
                  )}
                  {c.tipo === "valor" && (
                    <div className="flex gap-1">
                      <input className={inp} inputMode="decimal" placeholder="mín" value={filtros[c.chave]?.min ?? ""} onChange={(e) => setF(c.chave, { min: e.target.value })} />
                      <input className={inp} inputMode="decimal" placeholder="máx" value={filtros[c.chave]?.max ?? ""} onChange={(e) => setF(c.chave, { max: e.target.value })} />
                    </div>
                  )}
                  {c.tipo === "data" && (
                    <div className="flex gap-1">
                      <input type="date" className={inp} value={filtros[c.chave]?.de ?? ""} onChange={(e) => setF(c.chave, { de: e.target.value })} />
                      <input type="date" className={inp} value={filtros[c.chave]?.ate ?? ""} onChange={(e) => setF(c.chave, { ate: e.target.value })} />
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtradas.length === 0 ? (
              <tr><td colSpan={colunas.length} className="px-fluid-sm py-fluid-lg text-center text-kyron-silver/50">{vazio}</td></tr>
            ) : (
              filtradas.map((linha, i) => (
                <tr key={i} className="border-b border-[var(--kyron-hairline)] last:border-b-0 hover:bg-white/[0.02]">
                  {colunas.map((c) => (
                    <td key={c.chave} className={`px-fluid-sm py-fluid-xs text-kyron-white ${c.alinhar === "dir" ? "text-right" : "text-left"}`}>
                      {c.render
                        ? c.render(linha)
                        : c.tipo === "valor"
                          ? brl(Number(c.valor?.(linha) ?? 0))
                          : c.tipo === "data"
                            ? dataBR(String(c.valor?.(linha) ?? ""))
                            : String(c.valor?.(linha) ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
