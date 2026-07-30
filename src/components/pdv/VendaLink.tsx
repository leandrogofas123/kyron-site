"use client";

import { useState, useTransition } from "react";

import { acaoBuscarVenda, cancelarVenda, type VendaDetalhe } from "@/lib/pdv/acoes-venda";

const brl = (c: number) =>
  "R$ " + (c / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const FORMA_ROTULO: Record<string, string> = {
  pix: "PIX", dinheiro: "Dinheiro", credito: "Crédito", debito: "Débito",
  boleto: "Boleto", crediario: "Crediário", transferencia: "Transferência",
};

/** "Venda #NNNN" clicável: abre um popup com o detalhe, sem sair da página. */
export function VendaLink({ numero, label }: { numero: number; label?: string }) {
  const [venda, setVenda] = useState<VendaDetalhe | null>(null);
  const [aberto, setAberto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pend, start] = useTransition();

  function abrir() {
    setAberto(true);
    setErro(null);
    start(async () => {
      const v = await acaoBuscarVenda(numero);
      if (!v) setErro("Detalhes desta venda não estão disponíveis (venda anterior a este recurso).");
      setVenda(v);
    });
  }

  function imprimirRecibo(v: VendaDetalhe) {
    const larg = 32;
    const linhaItem = (n: string, val: string) => {
      const nome = n.length > larg - val.length - 1 ? n.slice(0, larg - val.length - 2) + "…" : n;
      return nome + " ".repeat(Math.max(1, larg - nome.length - val.length)) + val;
    };
    const itens = v.itens
      .map((it) => `${linhaItem(`${it.quantidade}x ${it.nome}`, brl(it.subtotal))}`)
      .join("\n");
    const tot = [
      linhaItem("Subtotal", brl(v.subtotal)),
      v.desconto > 0 ? linhaItem("Desconto", "-" + brl(v.desconto)) : "",
      linhaItem("TOTAL", brl(v.total)),
      linhaItem("Pagamento", FORMA_ROTULO[v.forma] ?? v.forma),
      v.taxaBps > 0 ? linhaItem("Liquido", brl(v.liquido)) : "",
    ].filter(Boolean).join("\n");
    const corpo = `KYRON TECNOLOGIA
Santa Cruz do Sul - RS
CNPJ 68.051.031/0001-05
${"=".repeat(larg)}
RECIBO DE VENDA #${v.numero}${v.status === "cancelada" ? "  [CANCELADA]" : ""}
${new Date(v.criadoEm).toLocaleString("pt-BR")}
${v.vendedorNome ? "Vendedor: " + v.vendedorNome : ""}
${v.clienteNome ? "Cliente: " + v.clienteNome : ""}
${"-".repeat(larg)}
${itens}
${"-".repeat(larg)}
${tot}
${"=".repeat(larg)}
Obrigado pela preferencia!
Recibo simples - nao e documento
fiscal (NF-e).`;
    const w = window.open("", "_blank", "width=360,height=640");
    if (!w) return;
    w.document.write(`<html><head><title>Recibo #${v.numero}</title><style>
      body{font:12px/1.5 ui-monospace,Menlo,monospace;white-space:pre;padding:14px;margin:0;color:#000}
      @media print{@page{margin:6mm}}
    </style></head><body>${corpo.replace(/</g, "&lt;")}</body></html>`);
    w.document.close();
    w.focus();
    w.print();
  }

  function estornar() {
    if (!confirm(`Cancelar e estornar a Venda #${numero}? Isso devolve o estoque e anula o financeiro.`)) return;
    start(async () => {
      const r = await cancelarVenda(numero);
      if (r.ok) { const v = await acaoBuscarVenda(numero); setVenda(v); }
      else setErro(r.erro);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        className="text-left text-kyron-blue underline decoration-dotted underline-offset-2 hover:decoration-solid"
      >
        {label ?? `Venda #${numero}`}
      </button>

      {aberto && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-fluid-md" onClick={() => setAberto(false)}>
          <div className="w-full max-w-[30rem] rounded-kyron-md border border-[var(--kyron-hairline-strong)] bg-kyron-graphite p-fluid-lg" onClick={(e) => e.stopPropagation()}>
            <div className="mb-fluid-sm flex items-baseline justify-between">
              <h3 className="kyron-display text-fluid-lg text-kyron-white">Venda #{numero}</h3>
              <button onClick={() => setAberto(false)} className="text-kyron-silver/60 hover:text-kyron-white">✕</button>
            </div>

            {pend && !venda ? (
              <p className="text-fluid-sm text-kyron-silver/60">Carregando…</p>
            ) : erro && !venda ? (
              <p className="text-fluid-sm text-kyron-silver">{erro}</p>
            ) : venda ? (
              <>
                <p className="text-fluid-2xs text-kyron-silver/60">
                  {new Date(venda.criadoEm).toLocaleString("pt-BR")}
                  {venda.vendedorNome ? ` · ${venda.vendedorNome}` : ""}
                  {venda.clienteNome ? ` · ${venda.clienteNome}` : ""}
                  {venda.status === "cancelada" && <span className="text-[var(--kyron-amber,#d9902f)]"> · CANCELADA</span>}
                </p>

                <ul className="my-fluid-sm space-y-1">
                  {venda.itens.map((it, i) => (
                    <li key={i} className="flex justify-between gap-2 text-fluid-sm">
                      <span className="min-w-0 truncate text-kyron-white">{it.quantidade}× {it.nome}</span>
                      <span className="shrink-0 text-kyron-silver">{brl(it.subtotal)}</span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-0.5 border-t border-[var(--kyron-hairline)] pt-fluid-sm text-fluid-sm">
                  <Row k="Subtotal" v={brl(venda.subtotal)} />
                  {venda.desconto > 0 && <Row k="Desconto" v={"− " + brl(venda.desconto)} />}
                  <Row k="Total" v={brl(venda.total)} forte />
                  <Row k={`Pagamento (${FORMA_ROTULO[venda.forma] ?? venda.forma})`} v={venda.taxaBps > 0 ? `${(venda.taxaBps / 100).toFixed(2).replace(".", ",")}% taxa` : "—"} />
                  {venda.taxaBps > 0 && <Row k="Líquido recebido" v={brl(venda.liquido)} />}
                </div>

                {erro && <p role="alert" className="mt-fluid-sm text-fluid-2xs text-[var(--kyron-amber,#d9902f)]">{erro}</p>}

                <div className="mt-fluid-md flex flex-wrap justify-end gap-fluid-xs">
                  <button onClick={() => imprimirRecibo(venda)}
                    className="kyron-label rounded-kyron-sm border border-[var(--kyron-hairline-strong)] px-fluid-md py-fluid-2xs text-fluid-2xs text-kyron-silver hover:text-kyron-white">
                    Imprimir recibo
                  </button>
                  {venda.status === "concluida" && (
                    <button onClick={estornar} disabled={pend}
                      className="kyron-label rounded-kyron-sm border border-[var(--kyron-hairline-strong)] px-fluid-md py-fluid-2xs text-fluid-2xs text-kyron-silver hover:text-[var(--kyron-amber,#d9902f)] disabled:opacity-50">
                      {pend ? "Estornando…" : "Cancelar / estornar"}
                    </button>
                  )}
                  <button onClick={() => setAberto(false)} className="kyron-label rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-2xs text-fluid-2xs text-white">Fechar</button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}

function Row({ k, v, forte }: { k: string; v: string; forte?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-kyron-silver/70">{k}</span>
      <span className={forte ? "font-semibold text-kyron-white" : "text-kyron-silver"}>{v}</span>
    </div>
  );
}

/** Renderiza a descrição de um lançamento/conta: se for "Venda #N", vira link. */
export function DescricaoComVenda({ texto }: { texto: string }) {
  const m = texto.match(/^Venda #(\d+)/);
  if (!m) return <>{texto}</>;
  return <VendaLink numero={Number(m[1])} label={texto} />;
}
