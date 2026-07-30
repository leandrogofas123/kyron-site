"use server";

import { revalidatePath } from "next/cache";

import { auditar } from "../core/audit";
import { db } from "../db";
import { parsePreco } from "../format";
import { exigirPermissao } from "./auth";

export type ProdutoQuick = {
  id: number;
  nome: string;
  sku: string | null;
  categoria: string | null;
  quantidade: number;
  quantidadeMinima: number;
  preco: number;
  precoCusto: number | null;
  localizacao: string | null;
};

/** Dados do produto para o popup rápido (a partir do estoque). */
export async function acaoProdutoQuick(id: number): Promise<ProdutoQuick | null> {
  await exigirPermissao("produtos.ver");
  const p = await db.produto.findUnique({
    where: { id },
    select: {
      id: true, nome: true, sku: true, quantidade: true, quantidadeMinima: true,
      preco: true, precoCusto: true, localizacao: true,
      categoria: { select: { nome: true } },
    },
  });
  if (!p) return null;
  return {
    id: p.id, nome: p.nome, sku: p.sku, categoria: p.categoria?.nome ?? null,
    quantidade: p.quantidade, quantidadeMinima: p.quantidadeMinima,
    preco: p.preco, precoCusto: p.precoCusto, localizacao: p.localizacao,
  };
}

/** Edição rápida (preço, custo, mínimo, localização). Saldo só por movimentação. */
export async function acaoSalvarProdutoQuick(
  id: number,
  dados: { preco: string; precoCusto: string; quantidadeMinima: string; localizacao: string },
): Promise<{ ok: true } | { ok: false; erro: string }> {
  const eu = await exigirPermissao("produtos.editar");
  const preco = parsePreco(dados.preco);
  if (preco == null || preco <= 0) return { ok: false, erro: "Preço inválido." };
  const custoRaw = dados.precoCusto.trim();
  const precoCusto = custoRaw ? parsePreco(custoRaw) : null;
  const min = Number(dados.quantidadeMinima) || 0;

  await db.produto.update({
    where: { id },
    data: {
      preco,
      precoCusto: precoCusto && precoCusto > 0 ? precoCusto : null,
      quantidadeMinima: min,
      localizacao: dados.localizacao.trim() || null,
    },
  });

  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp",
    acao: "editar-produto-rapido",
    entidade: "Produto",
    entidadeId: id,
    depois: { preco, precoCusto },
  });

  revalidatePath("/erp/estoque");
  revalidatePath("/erp/produtos");
  return { ok: true };
}
