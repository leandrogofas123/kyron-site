import "server-only";

import { db } from "../db";

/**
 * Consultas do módulo Financeiro (fluxo de caixa e contas). Só leitura; a
 * escrita vive em acoes.ts. O saldo é SEMPRE derivado do ledger de lançamentos.
 */

/** Saldo acumulado: soma de entradas menos saídas, até agora. */
export async function saldoAtual(): Promise<number> {
  const [ent, sai] = await Promise.all([
    db.lancamento.aggregate({ _sum: { valor: true }, where: { tipo: "entrada" } }),
    db.lancamento.aggregate({ _sum: { valor: true }, where: { tipo: "saida" } }),
  ]);
  return (ent._sum.valor ?? 0) - (sai._sum.valor ?? 0);
}

/** Receitas, despesas, lucro e quebra por categoria num período. */
export async function resumoPeriodo(inicio: Date, fim: Date) {
  const lancamentos = await db.lancamento.findMany({
    where: { data: { gte: inicio, lte: fim } },
    select: { tipo: true, valor: true, categoria: true },
  });

  let receitas = 0;
  let despesas = 0;
  const porCategoria = new Map<string, number>();

  for (const l of lancamentos) {
    if (l.tipo === "entrada") receitas += l.valor;
    else despesas += l.valor;
    const chave = `${l.tipo}:${l.categoria ?? "Sem categoria"}`;
    porCategoria.set(chave, (porCategoria.get(chave) ?? 0) + l.valor);
  }

  return {
    receitas,
    despesas,
    lucro: receitas - despesas,
    porCategoria: [...porCategoria.entries()].map(([chave, valor]) => {
      const [tipo, categoria] = chave.split(":");
      return { tipo, categoria, valor };
    }),
  };
}

/** Últimos lançamentos do caixa. */
export function listarLancamentos(limite = 100) {
  return db.lancamento.findMany({
    orderBy: [{ data: "desc" }, { id: "desc" }],
    take: limite,
  });
}

/** Contas em aberto de um tipo (pagar/receber), por vencimento. */
export function listarContas(tipo: "pagar" | "receber", status = "aberto") {
  return db.conta.findMany({
    where: { tipo, status },
    orderBy: { vencimento: "asc" },
  });
}

/** Totais em aberto e vencidos, para o painel. */
export async function totaisContas(tipo: "pagar" | "receber") {
  const abertas = await db.conta.findMany({
    where: { tipo, status: "aberto" },
    select: { valor: true, vencimento: true },
  });
  const agora = new Date();
  let total = 0;
  let vencido = 0;
  for (const c of abertas) {
    total += c.valor;
    if (c.vencimento < agora) vencido += c.valor;
  }
  return { total, vencido, quantidade: abertas.length };
}
