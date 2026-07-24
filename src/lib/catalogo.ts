import "server-only";

import { db } from "./db";

/**
 * Camada de acesso ao catálogo.
 *
 * Só o que o site público precisa. Regras de visibilidade da spec aplicadas
 * aqui, num só lugar:
 *  - produto inativo não aparece (ativo = true)
 *  - seminovo vendido sai da vitrine (vendido = false)
 */

const imagensOrdenadas = {
  imagens: { orderBy: [{ principal: "desc" as const }, { ordem: "asc" as const }] },
};

/** Árvore de categorias (pais com filhas) — para menu e filtros. */
export function getCategoriasArvore() {
  return db.categoria.findMany({
    where: { parentId: null },
    orderBy: { ordem: "asc" },
    include: { filhas: { orderBy: { ordem: "asc" } } },
  });
}

/** Todas as categorias em lista plana (admin, selects). */
export function getCategoriasPlanas() {
  return db.categoria.findMany({
    orderBy: [{ parentId: "asc" }, { ordem: "asc" }],
    include: { parent: true },
  });
}

/** Produtos em destaque para a home. */
export function getProdutosDestaque(limite = 8) {
  return db.produto.findMany({
    where: { ativo: true, destaque: true },
    orderBy: [{ ordem: "asc" }, { criadoEm: "desc" }],
    take: limite,
    include: { ...imagensOrdenadas, seminovo: true, categoria: true },
  });
}

/** Catálogo, opcionalmente filtrado por categoria (inclui subcategorias). */
export async function getProdutos(categoriaSlug?: string) {
  let categoriaIds: number[] | undefined;

  if (categoriaSlug) {
    const cat = await db.categoria.findUnique({
      where: { slug: categoriaSlug },
      include: { filhas: { select: { id: true } } },
    });
    if (!cat) return { categoria: null, produtos: [] };
    categoriaIds = [cat.id, ...cat.filhas.map((f) => f.id)];
  }

  const produtos = await db.produto.findMany({
    where: {
      ativo: true,
      ...(categoriaIds ? { categoriaId: { in: categoriaIds } } : {}),
    },
    orderBy: [{ ordem: "asc" }, { criadoEm: "desc" }],
    include: { ...imagensOrdenadas, seminovo: true, categoria: true },
  });

  const categoria = categoriaSlug
    ? await db.categoria.findUnique({ where: { slug: categoriaSlug } })
    : null;

  return { categoria, produtos };
}

export function getProduto(slug: string) {
  return db.produto.findFirst({
    where: { slug, ativo: true },
    include: { ...imagensOrdenadas, seminovo: true, categoria: true },
  });
}

/** Vitrine de seminovos: só disponíveis (não vendidos). */
export function getSeminovos() {
  return db.produto.findMany({
    where: { ativo: true, seminovo: { is: { vendido: false } } },
    orderBy: [{ ordem: "asc" }, { criadoEm: "desc" }],
    include: { ...imagensOrdenadas, seminovo: true, categoria: true },
  });
}

export function getServicos() {
  return db.servico.findMany({
    where: { ativo: true },
    orderBy: { ordem: "asc" },
  });
}

export function getServico(slug: string) {
  return db.servico.findFirst({ where: { slug, ativo: true } });
}

export type ProdutoComRelacoes = Awaited<ReturnType<typeof getProduto>>;
