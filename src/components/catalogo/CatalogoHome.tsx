"use client";

import { useMemo, useState } from "react";

import { ProdutoCard, type ProdutoCardData } from "./ProdutoCard";

/**
 * Catálogo da Home com busca em tempo real (client-side sobre os produtos já
 * carregados). Filtra por nome e marca — sem ida ao servidor. Para busca por
 * categoria/ordenação completa, o link leva a /produtos.
 */
export function CatalogoHome({ produtos }: { produtos: ProdutoCardData[] }) {
  const [q, setQ] = useState("");

  const filtrados = useMemo(() => {
    const termo = q.trim().toLowerCase();
    if (!termo) return produtos;
    return produtos.filter((p) =>
      `${p.nome} ${p.marca ?? ""}`.toLowerCase().includes(termo),
    );
  }, [produtos, q]);

  return (
    <div>
      <div className="mb-fluid-md flex flex-wrap items-center justify-between gap-fluid-sm">
        <div className="flex min-w-0 flex-1 items-center rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-black/50 transition-colors focus-within:border-[var(--kyron-blue-line)] sm:max-w-[28rem]">
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

      {filtrados.length === 0 ? (
        <p className="py-fluid-lg text-center text-fluid-sm text-kyron-silver">
          Nada encontrado para “{q}”. Tente outro termo ou fale no WhatsApp.
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
