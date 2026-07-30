"use server";

import { revalidatePath } from "next/cache";

import { auditar } from "../core/audit";
import { db } from "../db";
import { exigirPermissao } from "../erp/auth";
import { movimentarEstoque } from "../erp/estoque";
import { obterVendaPorNumero } from "./vendas";

export type VendaDetalhe = {
  numero: number;
  status: string;
  criadoEm: string;
  clienteNome: string | null;
  vendedorNome: string | null;
  subtotal: number;
  desconto: number;
  total: number;
  forma: string;
  taxaBps: number;
  liquido: number;
  itens: Array<{ nome: string; quantidade: number; precoUnit: number; subtotal: number }>;
};

/** Detalhe da venda para o popup (dados serializáveis). */
export async function acaoBuscarVenda(numero: number): Promise<VendaDetalhe | null> {
  await exigirPermissao("estoque.ver");
  const v = await obterVendaPorNumero(numero);
  if (!v) return null;
  return {
    numero: v.numero,
    status: v.status,
    criadoEm: v.criadoEm.toISOString(),
    clienteNome: v.cliente?.nome ?? null,
    vendedorNome: v.vendedorNome,
    subtotal: v.subtotal,
    desconto: v.desconto,
    total: v.total,
    forma: v.forma,
    taxaBps: v.taxaBps,
    liquido: v.liquido,
    itens: v.itens.map((i) => ({ nome: i.nome, quantidade: i.quantidade, precoUnit: i.precoUnit, subtotal: i.subtotal })),
  };
}

/**
 * Cancela/estorna uma venda: devolve o estoque (movimento de devolução),
 * anula o financeiro (conta cancelada ou lançamento de saída reverso) e marca
 * a venda como cancelada. Idempotente.
 */
export async function cancelarVenda(numero: number): Promise<{ ok: true } | { ok: false; erro: string }> {
  const eu = await exigirPermissao("estoque.movimentar");
  const v = await obterVendaPorNumero(numero);
  if (!v) return { ok: false, erro: "Venda não encontrada." };
  if (v.status !== "concluida") return { ok: false, erro: "Esta venda já foi cancelada." };

  // Devolve o estoque de cada item.
  for (const it of v.itens) {
    if (!it.produtoId) continue;
    await movimentarEstoque({
      produtoId: it.produtoId,
      tipo: "devolucao",
      quantidade: it.quantidade,
      documento: `Estorno #${v.numero}`,
      motivo: "Cancelamento de venda",
      usuarioId: eu.id,
      clienteId: v.clienteId,
    });
  }

  // Anula o financeiro: conta a receber vira cancelada; à vista, saída reversa.
  if (v.contaId) {
    await db.conta.update({ where: { id: v.contaId }, data: { status: "cancelado" } }).catch(() => {});
  } else {
    await db.lancamento.create({
      data: {
        tipo: "saida",
        valor: v.liquido,
        categoria: "Venda de produtos",
        descricao: `Estorno Venda #${v.numero}`,
        forma: v.forma,
        usuarioId: eu.id,
        usuarioNome: eu.nome,
      },
    });
  }

  await db.venda.update({ where: { id: v.id }, data: { status: "cancelada", canceladaEm: new Date() } });

  if (v.clienteId) {
    await db.interacao
      .create({ data: { tipo: "loja", conteudo: `Venda #${v.numero} cancelada/estornada`, clienteId: v.clienteId, autorNome: eu.nome } })
      .catch(() => {});
  }

  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp",
    acao: "cancelar-venda",
    entidade: "Venda",
    entidadeId: v.numero,
  });

  revalidatePath("/erp/financeiro");
  revalidatePath("/erp/estoque");
  revalidatePath("/erp");
  return { ok: true };
}
