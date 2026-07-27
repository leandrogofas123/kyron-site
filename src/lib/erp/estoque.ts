import "server-only";

import { db } from "../db";
import { sinalDe } from "./estoque-tipos";

/**
 * Regra central do estoque: NENHUM saldo muda sem gerar histórico.
 *
 * `Produto.quantidade` é um saldo denormalizado (leitura rápida nas telas), mas
 * a verdade é o ledger de MovimentacaoEstoque. Por isso as duas escritas
 * acontecem na MESMA transação — ou entram as duas, ou nenhuma.
 */

export { TIPOS_MOVIMENTACAO, rotuloTipo, type TipoMovimentacao } from "./estoque-tipos";

export type ResultadoMovimentacao =
  | { ok: true; saldo: number }
  | { ok: false; erro: string };

/**
 * Registra uma movimentação e atualiza o saldo, atomicamente.
 * `ajuste` define o saldo exato (correção de inventário); os demais somam ou
 * subtraem conforme o tipo.
 */
export async function movimentarEstoque(dados: {
  produtoId: number;
  tipo: string;
  quantidade: number;
  motivo?: string | null;
  documento?: string | null;
  observacao?: string | null;
  colaboradorId?: number | null;
  notaId?: number | null;
  clienteId?: number | null;
}): Promise<ResultadoMovimentacao> {
  const sinal = sinalDe(dados.tipo);
  if (sinal == null) return { ok: false, erro: "Tipo de movimentação inválido." };
  if (!Number.isInteger(dados.quantidade) || dados.quantidade < 0) {
    return { ok: false, erro: "Quantidade inválida." };
  }
  if (dados.tipo !== "ajuste" && dados.quantidade === 0) {
    return { ok: false, erro: "Informe uma quantidade maior que zero." };
  }

  try {
    const saldo = await db.$transaction(async (tx) => {
      const produto = await tx.produto.findUnique({
        where: { id: dados.produtoId },
        select: { quantidade: true, excluidoEm: true },
      });
      if (!produto || produto.excluidoEm) throw new Error("Produto não encontrado.");

      const saldoAntes = produto.quantidade;
      const saldoDepois =
        dados.tipo === "ajuste"
          ? dados.quantidade
          : saldoAntes + sinal * dados.quantidade;

      if (saldoDepois < 0) {
        throw new Error(
          `Saldo insuficiente: há ${saldoAntes} em estoque.`,
        );
      }

      await tx.movimentacaoEstoque.create({
        data: {
          produtoId: dados.produtoId,
          tipo: dados.tipo,
          quantidade:
            dados.tipo === "ajuste"
              ? Math.abs(saldoDepois - saldoAntes)
              : dados.quantidade,
          saldoAntes,
          saldoDepois,
          motivo: dados.motivo?.trim() || null,
          documento: dados.documento?.trim() || null,
          observacao: dados.observacao?.trim() || null,
          colaboradorId: dados.colaboradorId ?? null,
          notaId: dados.notaId ?? null,
          clienteId: dados.clienteId ?? null,
        },
      });

      await tx.produto.update({
        where: { id: dados.produtoId },
        data: { quantidade: saldoDepois },
      });

      return saldoDepois;
    });

    return { ok: true, saldo };
  } catch (erro) {
    const msg = erro instanceof Error ? erro.message : "Falha ao movimentar.";
    return { ok: false, erro: msg };
  }
}

/** Histórico (timeline) de um produto. */
export function historicoProduto(produtoId: number, limite = 50) {
  return db.movimentacaoEstoque.findMany({
    where: { produtoId },
    orderBy: { criadoEm: "desc" },
    take: limite,
    include: { colaborador: { select: { nome: true } } },
  });
}

/** Últimas movimentações do sistema todo. */
export function movimentacoesRecentes(limite = 60) {
  return db.movimentacaoEstoque.findMany({
    orderBy: { criadoEm: "desc" },
    take: limite,
    include: {
      produto: { select: { id: true, nome: true } },
      colaborador: { select: { nome: true } },
    },
  });
}
