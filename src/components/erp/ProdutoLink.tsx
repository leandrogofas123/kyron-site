"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { acaoProdutoQuick, acaoSalvarProdutoQuick, type ProdutoQuick } from "@/lib/erp/produto-quick";

const brl = (c: number) =>
  "R$ " + (c / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const bp = (c: number | null) => (c != null ? (c / 100).toFixed(2).replace(".", ",") : "");

const inp =
  "w-full rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-graphite px-fluid-sm py-fluid-2xs text-fluid-sm text-kyron-white focus:border-[var(--kyron-blue-line)] focus:outline-none";
const lbl = "kyron-label mb-1 block text-fluid-2xs text-kyron-silver/60";

/** Nome do produto clicável → popup de detalhe/edição rápida, sem redirecionar. */
export function ProdutoLink({ id, nome, podeEditar }: { id: number; nome: string; podeEditar: boolean }) {
  const [p, setP] = useState<ProdutoQuick | null>(null);
  const [aberto, setAberto] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [pend, start] = useTransition();

  // campos editáveis
  const [preco, setPreco] = useState("");
  const [custo, setCusto] = useState("");
  const [min, setMin] = useState("");
  const [loc, setLoc] = useState("");

  function abrir() {
    setAberto(true); setMsg(null);
    start(async () => {
      const d = await acaoProdutoQuick(id);
      setP(d);
      if (d) { setPreco(bp(d.preco)); setCusto(bp(d.precoCusto)); setMin(String(d.quantidadeMinima || "")); setLoc(d.localizacao ?? ""); }
    });
  }
  function salvar() {
    start(async () => {
      const r = await acaoSalvarProdutoQuick(id, { preco, precoCusto: custo, quantidadeMinima: min, localizacao: loc });
      if (r.ok) { setMsg("Salvo."); const d = await acaoProdutoQuick(id); setP(d); }
      else setMsg(r.erro);
    });
  }

  return (
    <>
      <button type="button" onClick={abrir} className="min-w-0 truncate text-left text-fluid-sm text-kyron-white hover:text-kyron-blue">
        {nome}
      </button>

      {aberto && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-fluid-md" onClick={() => setAberto(false)}>
          <div className="w-full max-w-[28rem] rounded-kyron-md border border-[var(--kyron-hairline-strong)] bg-kyron-graphite p-fluid-lg" onClick={(e) => e.stopPropagation()}>
            <div className="mb-fluid-sm flex items-baseline justify-between gap-2">
              <h3 className="kyron-display min-w-0 truncate text-fluid-lg text-kyron-white">{nome}</h3>
              <button onClick={() => setAberto(false)} className="shrink-0 text-kyron-silver/60 hover:text-kyron-white">✕</button>
            </div>

            {pend && !p ? (
              <p className="text-fluid-sm text-kyron-silver/60">Carregando…</p>
            ) : p ? (
              <>
                <p className="mb-fluid-sm text-fluid-2xs text-kyron-silver/60">
                  {[p.categoria, p.sku].filter(Boolean).join(" · ") || "—"} ·{" "}
                  <span className={p.quantidadeMinima > 0 && p.quantidade <= p.quantidadeMinima ? "text-[var(--kyron-amber,#d9902f)]" : ""}>
                    {p.quantidade} em estoque
                  </span>
                </p>

                {podeEditar ? (
                  <div className="grid grid-cols-2 gap-fluid-xs">
                    <label><span className={lbl}>Preço venda</span><input className={inp} inputMode="decimal" value={preco} onChange={(e) => setPreco(e.target.value)} /></label>
                    <label><span className={lbl}>Preço custo</span><input className={inp} inputMode="decimal" value={custo} onChange={(e) => setCusto(e.target.value)} /></label>
                    <label><span className={lbl}>Estoque mínimo</span><input className={inp} inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value)} /></label>
                    <label><span className={lbl}>Localização</span><input className={inp} value={loc} onChange={(e) => setLoc(e.target.value)} /></label>
                  </div>
                ) : (
                  <div className="space-y-1 text-fluid-sm">
                    <div className="flex justify-between"><span className="text-kyron-silver/70">Preço</span><span className="text-kyron-white">{brl(p.preco)}</span></div>
                    {p.localizacao && <div className="flex justify-between"><span className="text-kyron-silver/70">Local</span><span className="text-kyron-silver">{p.localizacao}</span></div>}
                  </div>
                )}

                {msg && <p className="mt-fluid-sm text-fluid-2xs text-kyron-silver/60">{msg}</p>}

                <div className="mt-fluid-md flex flex-wrap items-center justify-between gap-fluid-xs">
                  <Link href={`/erp/produtos/${p.id}`} className="text-fluid-2xs text-kyron-silver hover:text-kyron-white">Abrir ficha completa →</Link>
                  <div className="flex gap-fluid-xs">
                    {podeEditar && (
                      <button onClick={salvar} disabled={pend} className="kyron-label rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-2xs text-fluid-2xs text-white disabled:opacity-50">
                        {pend ? "Salvando…" : "Salvar"}
                      </button>
                    )}
                    <button onClick={() => setAberto(false)} className="kyron-label rounded-kyron-sm border border-[var(--kyron-hairline-strong)] px-fluid-md py-fluid-2xs text-fluid-2xs text-kyron-silver">Fechar</button>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-fluid-sm text-kyron-silver">Produto não encontrado.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
