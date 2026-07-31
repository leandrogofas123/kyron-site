"use client";

import { VendaLink } from "@/components/pdv/VendaLink";
import { TabelaFiltravel, type Coluna } from "@/components/erp/TabelaFiltravel";
import type { VendaLinha } from "@/lib/vendas/listar";

const FORMA: Record<string, string> = {
  pix: "PIX", dinheiro: "Dinheiro", credito: "Crédito", debito: "Débito",
  boleto: "Boleto", crediario: "Crediário", transferencia: "Transferência",
};

/** Tabela de vendas com filtro por coluna. O código abre o popup da venda. */
export function ListaVendas({ vendas }: { vendas: VendaLinha[] }) {
  const colunas: Coluna<VendaLinha>[] = [
    {
      chave: "numero", titulo: "Cód.", tipo: "texto",
      valor: (v) => v.numero,
      render: (v) => <VendaLink numero={v.numero} label={`#${v.numero}`} />,
    },
    { chave: "cliente", titulo: "Cliente", tipo: "texto", valor: (v) => v.cliente },
    { chave: "data", titulo: "Data", tipo: "data", valor: (v) => v.data },
    { chave: "itens", titulo: "Item(s) vendido(s)", tipo: "texto", valor: (v) => v.itens,
      render: (v) => <span className="line-clamp-1 max-w-[22rem]">{v.itens}</span> },
    { chave: "forma", titulo: "Pgto.", tipo: "texto", valor: (v) => FORMA[v.forma] ?? v.forma },
    {
      chave: "total", titulo: "Valor final", tipo: "valor", alinhar: "dir", valor: (v) => v.total,
      render: (v) => (
        <span className={v.status === "cancelada" ? "text-kyron-silver/40 line-through" : "font-semibold text-kyron-white"}>
          {"R$ " + (v.total / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
  ];

  return <TabelaFiltravel colunas={colunas} dados={vendas} vazio="Nenhuma venda no período." />;
}
