import "server-only";

import { db } from "../db";

/**
 * Consultas do ERP. Diferente da loja, aqui aparecem produtos inativos —
 * o que some é só o excluído logicamente (excluidoEm).
 */

const BUSCA_CAMPOS = [
  "nome",
  "marca",
  "modelo",
  "sku",
  "ean",
  "codigoInterno",
  "cor",
  "capacidade",
] as const;

export async function listarProdutos(opts?: {
  q?: string;
  categoriaId?: number;
  apenasBaixos?: boolean;
}) {
  const termo = opts?.q?.trim();

  const produtos = await db.produto.findMany({
    where: {
      excluidoEm: null,
      ...(opts?.categoriaId ? { categoriaId: opts.categoriaId } : {}),
      ...(termo
        ? {
            OR: BUSCA_CAMPOS.map((campo) => ({
              [campo]: { contains: termo, mode: "insensitive" as const },
            })),
          }
        : {}),
    },
    orderBy: [{ nome: "asc" }],
    take: 300,
    include: {
      categoria: { select: { nome: true } },
      fornecedor: { select: { nome: true } },
    },
  });

  return opts?.apenasBaixos
    ? produtos.filter((p) => p.quantidadeMinima > 0 && p.quantidade <= p.quantidadeMinima)
    : produtos;
}

export function obterProduto(id: number) {
  return db.produto.findFirst({
    where: { id, excluidoEm: null },
    include: {
      categoria: { select: { id: true, nome: true } },
      fornecedor: { select: { id: true, nome: true } },
      imagens: { orderBy: [{ principal: "desc" }, { ordem: "asc" }] },
    },
  });
}

/** Lista enxuta para seletores (movimentação de estoque). */
export function produtosParaSelecao() {
  return db.produto.findMany({
    where: { excluidoEm: null },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true, sku: true, quantidade: true },
  });
}

export function listarFornecedores() {
  return db.fornecedor.findMany({
    where: { excluidoEm: null },
    orderBy: { nome: "asc" },
  });
}

export function categoriasParaSelecao() {
  return db.categoria.findMany({
    orderBy: [{ parentId: "asc" }, { ordem: "asc" }],
    select: { id: true, nome: true, parentId: true },
  });
}
