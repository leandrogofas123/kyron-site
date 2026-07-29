import "server-only";

import { db } from "./db";
import type { OrdenarProdutos } from "./catalogo-ordenacao";

export { ORDENACOES, type OrdenarProdutos } from "./catalogo-ordenacao";

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

/** Preço que vale hoje (promo vence o cheio) — para ordenar por preço. */
function vigente(p: { preco: number; precoPromo: number | null }) {
  return p.precoPromo != null && p.precoPromo < p.preco ? p.precoPromo : p.preco;
}

/** Normaliza para busca: sem acento, minúsculo. */
function normalizar(t: string) {
  return t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/**
 * Catálogo, opcionalmente filtrado por categoria (inclui subcategorias),
 * por busca textual (nome/marca) e ordenado.
 *
 * Busca e ordenação-por-preço acontecem em memória: o catálogo é pequeno e o
 * SQLite não oferece "contains" sem acento nem ordenação pelo preço vigente
 * (que depende da promoção). Para dezenas de itens, é instantâneo e simples.
 */
export async function getProdutos(opts?: {
  categoria?: string;
  q?: string;
  ordenar?: OrdenarProdutos;
}) {
  const { categoria: categoriaSlug, q, ordenar = "relevancia" } = opts ?? {};
  let categoriaIds: number[] | undefined;

  if (categoriaSlug) {
    const cat = await db.categoria.findUnique({
      where: { slug: categoriaSlug },
      include: { filhas: { select: { id: true } } },
    });
    if (!cat) return { categoria: null, produtos: [] };
    categoriaIds = [cat.id, ...cat.filhas.map((f) => f.id)];
  }

  let produtos = await db.produto.findMany({
    where: {
      ativo: true,
      ...(categoriaIds ? { categoriaId: { in: categoriaIds } } : {}),
    },
    orderBy: [{ ordem: "asc" }, { criadoEm: "desc" }],
    include: { ...imagensOrdenadas, seminovo: true, categoria: true },
  });

  const termo = q?.trim();
  if (termo) {
    const alvo = normalizar(termo);
    produtos = produtos.filter((p) =>
      normalizar(`${p.nome} ${p.marca ?? ""}`).includes(alvo),
    );
  }

  if (ordenar === "menor-preco") {
    produtos.sort((a, b) => vigente(a) - vigente(b));
  } else if (ordenar === "maior-preco") {
    produtos.sort((a, b) => vigente(b) - vigente(a));
  } else if (ordenar === "novidades") {
    produtos.sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime());
  }
  // "relevancia": mantém a ordem curada do banco (ordem asc, criadoEm desc).

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


/** Token curto de modelo a partir do nome ("iPhone 15 128GB (exemplo)" → "iPhone 15"). */
function tokenModelo(produto: { modelo?: string | null; nome: string }): string {
  if (produto.modelo?.trim()) return produto.modelo.trim();
  return produto.nome
    .replace(/\(.*?\)/g, " ") // tira "(exemplo)"
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .join(" ");
}

/**
 * Produtos compatíveis com um dado produto (módulo Catalog).
 * Duas direções: acessórios que citam o modelo (ou "Universal") e produtos que
 * casam com a compatibilidade que ESTE item declara. Fallback: mesma categoria.
 */
export async function getCompativeis(
  produto: { id: number; nome: string; modelo?: string | null; compatibilidade?: string | null; categoriaId: number },
  limite = 6,
) {
  const alvo = tokenModelo(produto);
  const declarados = (produto.compatibilidade ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s && s.toLowerCase() !== "universal");

  const ou: Array<Record<string, unknown>> = [
    { compatibilidade: { contains: "Universal", mode: "insensitive" } },
  ];
  if (alvo) ou.push({ compatibilidade: { contains: alvo, mode: "insensitive" } });
  for (const t of declarados) ou.push({ nome: { contains: t, mode: "insensitive" } });

  const base = {
    take: limite,
    orderBy: [{ destaque: "desc" as const }, { ordem: "asc" as const }],
    include: { ...imagensOrdenadas, categoria: true, seminovo: true },
  };

  let itens = await db.produto.findMany({
    where: { ativo: true, excluidoEm: null, id: { not: produto.id }, OR: ou },
    ...base,
  });

  if (itens.length === 0) {
    itens = await db.produto.findMany({
      where: {
        ativo: true,
        excluidoEm: null,
        id: { not: produto.id },
        categoriaId: produto.categoriaId,
      },
      ...base,
    });
  }
  return itens;
}

/** Itens ativos que alimentam o configurador Monte seu Kit Celular. */
export function getProdutosParaKit() {
  return db.produto.findMany({
    where: { ativo: true },
    orderBy: [{ ordem: "asc" }, { criadoEm: "desc" }],
    include: { ...imagensOrdenadas, categoria: true, seminovo: true },
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
