"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ORDENACOES } from "@/lib/catalogo-ordenacao";

/**
 * Busca e ordenação do catálogo. Escreve na URL (?q= e ?ordenar=), preservando
 * a categoria ativa — assim a página continua renderizando no servidor e o
 * estado é compartilhável por link. A busca tem um pequeno atraso (debounce)
 * para não navegar a cada tecla.
 */
export function CatalogoControles({ total }: { total: number }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const primeiraRenderizacao = useRef(true);

  // Reflete mudanças externas de URL (ex.: clicar numa categoria) no campo.
  useEffect(() => {
    setQ(params.get("q") ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.get("q")]);

  function atualizar(mudanca: { q?: string; ordenar?: string }) {
    const novo = new URLSearchParams(params.toString());
    if ("q" in mudanca) {
      const v = mudanca.q?.trim();
      if (v) novo.set("q", v);
      else novo.delete("q");
    }
    if ("ordenar" in mudanca) {
      if (mudanca.ordenar && mudanca.ordenar !== "relevancia") {
        novo.set("ordenar", mudanca.ordenar);
      } else {
        novo.delete("ordenar");
      }
    }
    const qs = novo.toString();
    router.replace(qs ? `/produtos?${qs}` : "/produtos", { scroll: false });
  }

  // Debounce da busca.
  useEffect(() => {
    if (primeiraRenderizacao.current) {
      primeiraRenderizacao.current = false;
      return;
    }
    const t = setTimeout(() => {
      if (q.trim() !== (params.get("q") ?? "")) atualizar({ q });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const ordenarAtual = params.get("ordenar") ?? "relevancia";

  return (
    <div className="mt-fluid-lg flex flex-col items-center gap-fluid-sm">
      <label className="group flex w-full max-w-[26rem] items-center gap-fluid-xs rounded-kyron-sm border border-[var(--kyron-hairline-strong)] bg-kyron-graphite px-fluid-sm transition-colors duration-300 focus-within:border-[var(--kyron-blue-line)]">
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="shrink-0 text-kyron-silver/55"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3-3" />
        </svg>
        <input
          type="search"
          inputMode="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por iPhone, câmera, fone…"
          aria-label="Buscar produtos"
          className="w-full bg-transparent py-fluid-xs text-fluid-sm text-kyron-white placeholder:text-kyron-silver/45 focus:outline-none"
        />
      </label>

      <div className="flex flex-wrap items-center justify-center gap-x-fluid-sm gap-y-fluid-2xs">
        <label className="inline-flex items-center gap-fluid-xs text-fluid-2xs text-kyron-silver">
          <span className="kyron-label">Ordenar</span>
          <select
            value={ordenarAtual}
            onChange={(e) => atualizar({ ordenar: e.target.value })}
            className="rounded-kyron-sm border border-[var(--kyron-hairline-strong)] bg-kyron-graphite px-fluid-xs py-fluid-2xs text-fluid-2xs text-kyron-white transition-colors duration-300 focus:border-[var(--kyron-blue-line)] focus:outline-none"
          >
            {ORDENACOES.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.rotulo}
              </option>
            ))}
          </select>
        </label>
        <span aria-live="polite" className="text-fluid-2xs text-kyron-silver/55">
          {total} {total === 1 ? "produto" : "produtos"}
        </span>
      </div>
    </div>
  );
}
