"use client";

import { useMemo, useState } from "react";

import { ProdutoCard, type ProdutoCardData } from "./ProdutoCard";

/** Produto + a categoria-raiz (para o filtro de chips). */
export type ProdutoHome = ProdutoCardData & { catSlug: string | null };

/**
 * Catálogo da Home com busca em tempo real + filtro por categoria (chips),
 * tudo client-side sobre os produtos já carregados. Para ordenação e busca
 * avançada, o link leva a /produtos.
 */
export function CatalogoHome({
  produtos,
  categorias,
}: {
  produtos: ProdutoHome[];
  categorias: { slug: string; nome: string }[];
}) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);

  const filtrados = useMemo(() => {
    const termo = q.trim().toLowerCase();
    return produtos.filter((p) => {
      if (cat && p.catSlug !== cat) return false;
      if (termo && !`${p.nome} ${p.marca ?? ""}`.toLowerCase().includes(termo)) return false;
      return true;
    });
  }, [produtos, q, cat]);

  const chip = (ativo: boolean) =>
    `kyron-label whitespace-nowrap rounded-full border px-fluid-sm py-fluid-2xs text-fluid-2xs transition-colors ${
      ativo
        ? "border-[var(--kyron-blue-line)] bg-kyron-blue text-white"
        : "border-[var(--kyron-hairline-strong)] text-kyron-silver hover:border-[var(--kyron-blue-line)] hover:text-kyron-white"
    }`;

  return (
    <div>
      <div className="mb-fluid-sm flex flex-wrap items-center justify-between gap-fluid-sm">
        <div className="flex min-w-0 flex-1 items-center rounded-kyron-sm border-2 border-[var(--kyron-hairline)] bg-kyron-black/50 transition-colors focus-within:border-kyron-blue sm:max-w-[28rem]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="ml-2.5 shrink-0 text-kyron-silver/55">
            <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.7" />
            <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome ou marca…"
            aria-label="Buscar produtos"
            className="min-w-0 flex-1 bg-transparent py-2.5 pl-2 pr-3 text-fluid-sm text-kyron-white placeholder:text-kyron-silver/45 focus:outline-none"
          />
        </div>
        <span className="shrink-0 text-fluid-2xs text-kyron-silver/60">
          {filtrados.length} de {produtos.length}
        </span>
      </div>

      {/* Chips de categoria */}
      {categorias.length > 0 && (
        <div className="kyron-scroll mb-fluid-md flex gap-fluid-2xs overflow-x-auto pb-1">
          <button type="button" onClick={() => setCat(null)} className={chip(cat === null)}>
            Todos
          </button>
          {categorias.map((c) => (
            <button key={c.slug} type="button" onClick={() => setCat(c.slug)} className={chip(cat === c.slug)}>
              {c.nome}
            </button>
          ))}
        </div>
      )}

      {filtrados.length === 0 ? (
        <p className="py-fluid-lg text-center text-fluid-sm text-kyron-silver">
          Nada encontrado{q ? ` para “${q}”` : ""}. Tente outro termo ou fale no WhatsApp.
        </p>
      ) : (
        <ul className="grid-fluida-6">
          {filtrados.map((p, i) => (
            <li key={p.slug}>
              <ProdutoCard produto={p} prioridade={i < 6} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
