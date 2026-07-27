import "server-only";

import { db } from "../db";
import { sinalDe } from "./estoque-tipos";

/** Nº de dias exibidos no gráfico de movimentação. */
export const DIAS_GRAFICO = 14;

function diaISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export type PontoMovimentacao = {
  dia: string;   // YYYY-MM-DD
  rotulo: string; // dd/mm
  entradas: number;
  saidas: number;
};

/**
 * Série diária de entradas x saídas dos últimos dias.
 * "Ajuste" fica de fora: corrige inventário, não representa fluxo real.
 */
export async function serieMovimentacao(
  dias = DIAS_GRAFICO,
  agora = new Date(),
): Promise<PontoMovimentacao[]> {
  const inicio = new Date(agora);
  inicio.setHours(0, 0, 0, 0);
  inicio.setDate(inicio.getDate() - (dias - 1));

  const movimentacoes = await db.movimentacaoEstoque.findMany({
    where: { criadoEm: { gte: inicio } },
    select: { tipo: true, quantidade: true, criadoEm: true },
  });

  const mapa = new Map<string, PontoMovimentacao>();
  for (let i = 0; i < dias; i++) {
    const d = new Date(inicio);
    d.setDate(inicio.getDate() + i);
    mapa.set(diaISO(d), {
      dia: diaISO(d),
      rotulo: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
      entradas: 0,
      saidas: 0,
    });
  }

  for (const m of movimentacoes) {
    const ponto = mapa.get(diaISO(m.criadoEm));
    if (!ponto) continue;
    const sinal = sinalDe(m.tipo);
    if (sinal === 1) ponto.entradas += m.quantidade;
    else if (sinal === -1) ponto.saidas += m.quantidade;
  }

  return [...mapa.values()];
}

/** Ranking por quantidade vendida (movimentações do tipo venda). */
export async function maisVendidos(limite = 5) {
  const agrupado = await db.movimentacaoEstoque.groupBy({
    by: ["produtoId"],
    where: { tipo: "venda" },
    _sum: { quantidade: true },
    orderBy: { _sum: { quantidade: "desc" } },
    take: limite,
  });

  if (agrupado.length === 0) return [];

  const produtos = await db.produto.findMany({
    where: { id: { in: agrupado.map((a) => a.produtoId) } },
    select: { id: true, nome: true },
  });
  const nomePorId = new Map(produtos.map((p) => [p.id, p.nome]));

  return agrupado.map((a) => ({
    produtoId: a.produtoId,
    nome: nomePorId.get(a.produtoId) ?? "Produto removido",
    total: a._sum.quantidade ?? 0,
  }));
}

/** Últimas movimentações de um lado só (entradas ou saídas). */
export async function ultimasPorFluxo(
  fluxo: "entrada" | "saida",
  limite = 5,
) {
  const tipos =
    fluxo === "entrada"
      ? ["entrada", "devolucao"]
      : ["venda", "saida", "troca", "assistencia", "transferencia", "perda"];

  return db.movimentacaoEstoque.findMany({
    where: { tipo: { in: tipos } },
    orderBy: { criadoEm: "desc" },
    take: limite,
    include: { produto: { select: { id: true, nome: true } } },
  });
}

/**
 * Garantias a vencer: cada venda de um produto com garantia gera um prazo
 * (data da venda + meses). Lista o que vence nos próximos `dias`.
 */
export async function garantiasAVencer(dias = 30, agora = new Date()) {
  const vendas = await db.movimentacaoEstoque.findMany({
    where: {
      tipo: "venda",
      produto: { garantiaMeses: { gt: 0 } },
    },
    orderBy: { criadoEm: "desc" },
    take: 200,
    include: {
      produto: { select: { id: true, nome: true, garantiaMeses: true } },
    },
  });

  const limite = new Date(agora);
  limite.setDate(limite.getDate() + dias);

  return vendas
    .map((v) => {
      const vence = new Date(v.criadoEm);
      vence.setMonth(vence.getMonth() + (v.produto.garantiaMeses ?? 0));
      return { id: v.id, produto: v.produto, documento: v.documento, vence };
    })
    .filter((g) => g.vence >= agora && g.vence <= limite)
    .sort((a, b) => a.vence.getTime() - b.vence.getTime())
    .slice(0, 8);
}
