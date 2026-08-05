"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import {
  acaoBuscarClientes,
  acaoBuscarProdutos,
  acaoClienteRapido,
  finalizarVenda,
} from "@/lib/pdv/acoes";
import type { ProdutoPDV } from "@/lib/pdv/pdv";

const brl = (c: number) =>
  "R$ " + (c / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type Item = ProdutoPDV & { qty: number };
type Vendedor = { id: number; nome: string };
type Maquininha = { id: number; nome: string; taxaDebito: number; taxasCredito: Record<string, number> };

function taxaCliente(m: Maquininha, forma: string, parcelas: number): number {
  if (forma === "debito") return m.taxaDebito;
  return m.taxasCredito[String(parcelas)] ?? m.taxasCredito["1"] ?? 0;
}

const FORMAS: Array<[string, string]> = [
  ["pix", "PIX"],
  ["dinheiro", "Dinheiro"],
  ["credito", "Crédito"],
  ["debito", "Débito"],
  ["boleto", "Boleto"],
  ["crediario", "Crediário"],
];
const A_PRAZO = new Set(["credito", "boleto", "crediario"]);

const inp =
  "w-full rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-graphite px-fluid-sm py-fluid-xs text-fluid-base text-kyron-white placeholder:text-kyron-silver/40 focus:border-[var(--kyron-blue-line)] focus:outline-none";
const lbl = "kyron-label mb-fluid-2xs block text-fluid-2xs text-kyron-silver/60";

export function PdvClient({
  vendedores,
  maquininhas,
  onFinalizada,
}: {
  vendedores: Vendedor[];
  maquininhas: Maquininha[];
  onFinalizada?: (numero: number) => void;
}) {
  const [itens, setItens] = useState<Item[]>([]);
  const [descTexto, setDescTexto] = useState("");
  const [descPct, setDescPct] = useState(false);
  const [forma, setForma] = useState("pix");
  const [maqId, setMaqId] = useState<number>(maquininhas[0]?.id ?? 0);
  const [parcelas, setParcelas] = useState(1);
  const [vendedorId, setVendedorId] = useState(vendedores[0]?.id ?? 0);

  const [prodBusca, setProdBusca] = useState("");
  const [prodRes, setProdRes] = useState<ProdutoPDV[]>([]);
  const [prodSel, setProdSel] = useState(0);
  const prodRef = useRef<HTMLInputElement>(null);

  const [cliBusca, setCliBusca] = useState("");
  const [cliRes, setCliRes] = useState<Array<{ id: number; nome: string; telefone: string | null }>>([]);
  const [cliente, setCliente] = useState<{ id: number; nome: string } | null>(null);
  const [modal, setModal] = useState(false);

  const [toast, setToast] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pend, start] = useTransition();

  // ---- busca de produto (debounce) ----
  useEffect(() => {
    if (prodBusca.trim().length < 2) { setProdRes([]); return; }
    const h = setTimeout(async () => {
      const r = await acaoBuscarProdutos(prodBusca);
      setProdRes(r);
      setProdSel(0);
    }, 160);
    return () => clearTimeout(h);
  }, [prodBusca]);

  // ---- busca de cliente (debounce) ----
  useEffect(() => {
    if (cliBusca.trim().length < 2 || cliente) { setCliRes([]); return; }
    const h = setTimeout(async () => setCliRes(await acaoBuscarClientes(cliBusca)), 200);
    return () => clearTimeout(h);
  }, [cliBusca, cliente]);

  function addProduto(p: ProdutoPDV) {
    setItens((prev) => {
      const ex = prev.find((i) => i.id === p.id);
      if (ex) return prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { ...p, qty: 1 }];
    });
    setProdBusca("");
    setProdRes([]);
    prodRef.current?.focus();
  }
  function mudarQty(id: number, d: number) {
    setItens((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + d } : i))
        .filter((i) => i.qty > 0),
    );
  }
  function remover(id: number) {
    setItens((prev) => prev.filter((i) => i.id !== id));
  }

  // ---- totais ----
  const subtotal = itens.reduce((s, i) => s + i.preco * i.qty, 0);
  const custo = itens.reduce((s, i) => s + i.custo * i.qty, 0);
  const descNum = Number(descTexto.replace(",", ".")) || 0;
  let desconto = descPct ? Math.round(subtotal * (descNum / 100)) : Math.round(descNum * 100);
  desconto = Math.max(0, Math.min(desconto, subtotal));
  const total = subtotal - desconto;
  const lucro = custo > 0 ? total - custo : 0;
  const margem = total > 0 && custo > 0 ? (lucro / total) * 100 : 0;
  const qtdItens = itens.reduce((s, i) => s + i.qty, 0);

  // cartão: taxa da maquininha → líquido
  const ehCartao = forma === "credito" || forma === "debito";
  const maq = maquininhas.find((m) => m.id === maqId) ?? null;
  const bps = ehCartao && maq ? taxaCliente(maq, forma, parcelas) : 0;
  const liquido = Math.round(total * (1 - bps / 10000));

  function finalizar() {
    setErro(null);
    start(async () => {
      const r = await finalizarVenda({
        itens: itens.map((i) => ({ produtoId: i.id, quantidade: i.qty })),
        clienteId: cliente?.id ?? null,
        descontoCentavos: desconto,
        forma,
        maquininhaId: ehCartao ? maqId : null,
        parcelas: forma === "credito" ? parcelas : 1,
        vendedorId,
      });
      if (!r.ok) { setErro(r.erro); return; }
      setToast(`Venda #${r.numero} registrada — ${brl(r.total)}`);
      setItens([]); setDescTexto(""); setCliente(null); setCliBusca("");
      setTimeout(() => setToast(null), 4000);
      onFinalizada?.(r.numero);
    });
  }

  async function salvarCliente(dados: { nome: string; telefone: string; cpf: string; email: string }) {
    const r = await acaoClienteRapido(dados);
    if (r.ok) { setCliente({ id: r.id, nome: r.nome }); setModal(false); }
    else setErro(r.erro);
  }

  // ---- atalhos ----
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "F3") { e.preventDefault(); prodRef.current?.focus(); }
      if (e.key === "F2") { e.preventDefault(); if (itens.length && !pend) finalizar(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itens, pend, desconto, forma, cliente]);

  return (
    <div className="grid gap-fluid-lg xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
      {/* ---------- área de trabalho ---------- */}
      <div className="space-y-fluid-md">
        <div className="grid gap-fluid-sm sm:grid-cols-[1fr_12rem]">
          <div className="relative">
            <span className={lbl}>Cliente</span>
            <div className="flex gap-fluid-2xs">
              <input
                className={inp}
                placeholder="Buscar por nome, telefone ou CPF…"
                value={cliente ? cliente.nome : cliBusca}
                onChange={(e) => { setCliente(null); setCliBusca(e.target.value); }}
              />
              <button
                type="button"
                onClick={() => setModal(true)}
                className="kyron-label shrink-0 rounded-kyron-sm border border-[var(--kyron-hairline-strong)] px-fluid-sm text-fluid-2xs text-kyron-silver transition-colors hover:text-kyron-white"
              >
                + Cliente
              </button>
            </div>
            {cliRes.length > 0 && !cliente && (
              <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-kyron-md border border-[var(--kyron-hairline-strong)] bg-kyron-graphite shadow-lg">
                {cliRes.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => { setCliente({ id: c.id, nome: c.nome }); setCliRes([]); }}
                    className="block w-full px-fluid-sm py-fluid-xs text-left text-fluid-sm text-kyron-white hover:bg-kyron-blue/10"
                  >
                    {c.nome}
                    {c.telefone ? <span className="text-fluid-2xs text-kyron-silver/50"> · {c.telefone}</span> : null}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <span className={lbl}>Vendedor</span>
            <select className={inp} value={vendedorId} onChange={(e) => setVendedorId(Number(e.target.value))}>
              {vendedores.map((v) => (
                <option key={v.id} value={v.id}>{v.nome}</option>
              ))}
            </select>
          </div>
        </div>

        {/* busca de produto */}
        <div className="relative">
          <span className={lbl}>Produto</span>
          <input
            ref={prodRef}
            className={`${inp} py-fluid-sm text-fluid-lg`}
            placeholder="Nome, SKU, código de barras, IMEI ou série…  (F3)"
            value={prodBusca}
            onChange={(e) => setProdBusca(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setProdSel((s) => Math.min(s + 1, prodRes.length - 1)); }
              else if (e.key === "ArrowUp") { e.preventDefault(); setProdSel((s) => Math.max(s - 1, 0)); }
              else if (e.key === "Enter" && prodRes[prodSel]) { e.preventDefault(); addProduto(prodRes[prodSel]); }
              else if (e.key === "Escape") setProdRes([]);
            }}
            autoFocus
          />
          {prodRes.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-kyron-md border border-[var(--kyron-hairline-strong)] bg-kyron-graphite shadow-lg">
              {prodRes.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onMouseEnter={() => setProdSel(i)}
                  onClick={() => addProduto(p)}
                  className={`flex w-full items-center gap-fluid-sm px-fluid-sm py-fluid-xs text-left ${i === prodSel ? "bg-kyron-blue/10" : ""}`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-fluid-sm text-kyron-white">{p.nome}</div>
                    <div className="truncate text-fluid-2xs text-kyron-silver/50">
                      {p.meta}{p.sku ? ` · ${p.sku}` : ""}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-fluid-sm font-semibold text-kyron-white">{brl(p.preco)}</div>
                    <div className={`text-fluid-2xs ${p.quantidade <= 2 ? "text-[var(--kyron-amber,#d9902f)]" : "text-kyron-silver/50"}`}>
                      {p.quantidade} un.{p.temImei ? " · IMEI" : ""}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* grid */}
        <div className="overflow-hidden rounded-kyron-md border border-[var(--kyron-hairline)]">
          <div className="grid grid-cols-[1fr_7rem_7rem_2rem] items-center gap-fluid-xs border-b border-[var(--kyron-hairline)] bg-kyron-graphite px-fluid-sm py-fluid-xs">
            <span className="kyron-label text-fluid-2xs text-kyron-silver/60">Produto</span>
            <span className="kyron-label text-center text-fluid-2xs text-kyron-silver/60">Qtd.</span>
            <span className="kyron-label text-right text-fluid-2xs text-kyron-silver/60">Subtotal</span>
            <span />
          </div>
          {itens.length === 0 ? (
            <p className="px-fluid-md py-fluid-xl text-center text-fluid-sm text-kyron-silver/50">
              Busque um produto acima ou aperte <span className="rounded border border-[var(--kyron-hairline-strong)] px-1.5 py-0.5 font-mono text-fluid-2xs">F3</span> para começar.
            </p>
          ) : (
            itens.map((i) => (
              <div key={i.id} className="grid grid-cols-[1fr_7rem_7rem_2rem] items-center gap-fluid-xs border-b border-[var(--kyron-hairline)] px-fluid-sm py-fluid-xs last:border-b-0">
                <div className="min-w-0">
                  <div className="truncate text-fluid-sm text-kyron-white">{i.nome}</div>
                  <div className="text-fluid-2xs text-kyron-silver/50">
                    {brl(i.preco)}
                    {i.qty > i.quantidade ? <span className="text-[var(--kyron-amber,#d9902f)]"> · estoque {i.quantidade}</span> : ""}
                    {i.temImei ? <span className="text-kyron-blue"> · IMEI</span> : ""}
                  </div>
                </div>
                <div className="mx-auto inline-flex items-center overflow-hidden rounded-kyron-sm border border-[var(--kyron-hairline-strong)]">
                  <button type="button" onClick={() => mudarQty(i.id, -1)} className="h-7 w-7 bg-kyron-graphite text-kyron-silver hover:text-kyron-white">−</button>
                  <span className="w-8 text-center text-fluid-sm font-semibold text-kyron-white">{i.qty}</span>
                  <button type="button" onClick={() => mudarQty(i.id, 1)} className="h-7 w-7 bg-kyron-graphite text-kyron-silver hover:text-kyron-white">+</button>
                </div>
                <span className="text-right text-fluid-sm font-semibold text-kyron-white">{brl(i.preco * i.qty)}</span>
                <button type="button" onClick={() => remover(i.id)} className="mx-auto text-kyron-silver/50 hover:text-[var(--kyron-amber,#d9902f)]" aria-label="Remover">✕</button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ---------- trilho ---------- */}
      <aside className="space-y-fluid-md rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-md xl:sticky xl:top-fluid-md">
        <div>
          <div className="mb-fluid-2xs flex items-center justify-between">
            <span className="kyron-label text-fluid-2xs text-kyron-silver/60">Desconto</span>
            <span className="text-fluid-2xs text-kyron-silver/50">{qtdItens} {qtdItens === 1 ? "item" : "itens"}</span>
          </div>
          <div className="flex items-stretch gap-fluid-2xs">
            <input className={inp} inputMode="decimal" placeholder="0" value={descTexto} onChange={(e) => setDescTexto(e.target.value)} />
            <div className="inline-flex shrink-0 overflow-hidden rounded-kyron-sm border border-[var(--kyron-hairline-strong)]">
              <button
                type="button"
                aria-pressed={!descPct}
                onClick={() => setDescPct(false)}
                className={`flex min-w-[2.75rem] items-center justify-center px-fluid-sm text-fluid-sm font-bold leading-none transition-colors ${!descPct ? "bg-kyron-blue text-white" : "bg-kyron-graphite text-kyron-silver hover:text-kyron-white"}`}
              >
                R$
              </button>
              <button
                type="button"
                aria-pressed={descPct}
                onClick={() => setDescPct(true)}
                className={`flex min-w-[2.75rem] items-center justify-center border-l border-[var(--kyron-hairline-strong)] px-fluid-sm text-fluid-sm font-bold leading-none transition-colors ${descPct ? "bg-kyron-blue text-white" : "bg-kyron-graphite text-kyron-silver hover:text-kyron-white"}`}
              >
                %
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <Linha k="Subtotal" v={brl(subtotal)} forte />
          <Linha k="Desconto" v={"− " + brl(desconto)} />
          <Linha k="Lucro" v={custo > 0 ? brl(lucro) : "—"} />
          <Linha k="Margem" v={custo > 0 ? margem.toFixed(1).replace(".", ",") + "%" : "—"} alerta={custo > 0 && margem < 12} />
          <div className="my-fluid-2xs h-px bg-[var(--kyron-hairline)]" />
          <div className="flex items-baseline justify-between pt-fluid-2xs">
            <span className="text-fluid-sm font-semibold text-kyron-white">Total</span>
            <span className="text-fluid-2xl font-bold text-kyron-blue">{brl(total)}</span>
          </div>
        </div>

        <div>
          <span className={lbl}>Pagamento</span>
          <div className="flex flex-wrap gap-fluid-2xs">
            {FORMAS.map(([v, r]) => (
              <button
                key={v}
                type="button"
                onClick={() => setForma(v)}
                className={`rounded-full border px-fluid-sm py-fluid-2xs text-fluid-2xs font-semibold transition-colors ${
                  forma === v
                    ? "border-[var(--kyron-blue-line)] bg-kyron-blue/10 text-kyron-white"
                    : "border-[var(--kyron-hairline-strong)] bg-kyron-graphite text-kyron-silver hover:text-kyron-white"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          {A_PRAZO.has(forma) && total > 0 && (
            <p className="mt-fluid-2xs text-fluid-2xs text-kyron-silver/60">
              A prazo — gera conta a receber (venc. em 30 dias).
            </p>
          )}

          {ehCartao && (
            <div className="mt-fluid-xs space-y-fluid-2xs rounded-kyron-sm border border-[var(--kyron-hairline)] p-fluid-xs">
              {maquininhas.length === 0 ? (
                <p className="text-fluid-2xs text-kyron-silver/60">
                  Nenhuma maquininha ativa. Cadastre em Maquininhas & taxas para descontar automático.
                </p>
              ) : (
                <>
                  <div className="flex gap-fluid-2xs">
                    <select value={maqId} onChange={(e) => setMaqId(Number(e.target.value))}
                      className="flex-1 rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-graphite px-fluid-xs py-fluid-2xs text-fluid-2xs text-kyron-white focus:outline-none">
                      {maquininhas.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
                    </select>
                    {forma === "credito" && (
                      <select value={parcelas} onChange={(e) => setParcelas(Number(e.target.value))}
                        className="rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-graphite px-fluid-xs py-fluid-2xs text-fluid-2xs text-kyron-white focus:outline-none">
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((p) => <option key={p} value={p}>{p}x</option>)}
                      </select>
                    )}
                  </div>
                  <div className="flex justify-between text-fluid-2xs">
                    <span className="text-kyron-silver/60">Taxa {(bps / 100).toFixed(2).replace(".", ",")}%</span>
                    <span className="text-kyron-silver">Líquido <span className="font-semibold text-kyron-white">{brl(liquido)}</span></span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {erro && <p role="alert" className="text-fluid-2xs text-[var(--kyron-amber,#d9902f)]">{erro}</p>}

        <button
          type="button"
          onClick={finalizar}
          disabled={itens.length === 0 || pend}
          className="flex w-full items-center justify-center gap-fluid-xs rounded-kyron-md bg-kyron-blue px-fluid-md py-fluid-sm text-fluid-base font-bold text-white transition-all hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pend ? "Finalizando…" : "Finalizar venda"}
          <span className="rounded border border-white/20 px-1.5 py-0.5 font-mono text-fluid-2xs">F2</span>
        </button>
      </aside>

      {/* ---------- toast ---------- */}
      {toast && (
        <div className="fixed bottom-fluid-md right-fluid-md z-50 flex items-center gap-fluid-xs rounded-kyron-md border border-[var(--kyron-blue-line)] bg-kyron-graphite px-fluid-md py-fluid-sm shadow-xl">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-kyron-blue/15 text-kyron-blue">✓</span>
          <span className="text-fluid-sm text-kyron-white">{toast}</span>
        </div>
      )}

      {/* ---------- modal cliente ---------- */}
      {modal && <ModalCliente onSalvar={salvarCliente} onFechar={() => setModal(false)} />}
    </div>
  );
}

function Linha({ k, v, forte, alerta }: { k: string; v: string; forte?: boolean; alerta?: boolean }) {
  return (
    <div className="flex items-baseline justify-between py-0.5 text-fluid-sm">
      <span className="text-kyron-silver/70">{k}</span>
      <span className={forte ? "font-semibold text-kyron-white" : alerta ? "text-[var(--kyron-amber,#d9902f)]" : "text-kyron-silver"}>{v}</span>
    </div>
  );
}

function ModalCliente({
  onSalvar,
  onFechar,
}: {
  onSalvar: (d: { nome: string; telefone: string; cpf: string; email: string }) => void;
  onFechar: () => void;
}) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-fluid-md" onClick={onFechar}>
      <div className="w-full max-w-[26rem] rounded-kyron-md border border-[var(--kyron-hairline-strong)] bg-kyron-graphite p-fluid-lg" onClick={(e) => e.stopPropagation()}>
        <h3 className="kyron-display text-fluid-lg text-kyron-white">Cadastro rápido de cliente</h3>
        <p className="mb-fluid-md text-fluid-2xs text-kyron-silver/60">Ao salvar, já entra selecionado na venda.</p>
        <div className="space-y-fluid-xs">
          <div><span className={lbl}>Nome</span><input className={inp} value={nome} onChange={(e) => setNome(e.target.value)} autoFocus /></div>
          <div className="grid grid-cols-2 gap-fluid-xs">
            <div><span className={lbl}>Telefone</span><input className={inp} value={telefone} onChange={(e) => setTelefone(e.target.value)} /></div>
            <div><span className={lbl}>CPF/CNPJ</span><input className={inp} value={cpf} onChange={(e) => setCpf(e.target.value)} /></div>
          </div>
          <div><span className={lbl}>E-mail</span><input className={inp} value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        </div>
        <div className="mt-fluid-md flex justify-end gap-fluid-xs">
          <button type="button" onClick={onFechar} className="kyron-label rounded-kyron-sm border border-[var(--kyron-hairline-strong)] px-fluid-md py-fluid-2xs text-fluid-2xs text-kyron-silver hover:text-kyron-white">Cancelar</button>
          <button type="button" onClick={() => onSalvar({ nome, telefone, cpf, email })} className="kyron-label rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-2xs text-fluid-2xs text-white">Salvar cliente</button>
        </div>
      </div>
    </div>
  );
}
