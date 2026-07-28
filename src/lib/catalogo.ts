import "server-only";

import { cachear, TAG } from "./cache";
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
 *
 * CACHE: as leituras públicas passam por `cachear()` (ver `./cache.ts`). O
 * Postgres deixa de ser consultado a cada visita, e as ações do admin invalidam
 * por tag na hora que salvam. Leituras do ADMIN não são cacheadas — quem acabou
 * de salvar precisa ver o próprio dado, não uma cópia de 5 minutos atrás.
 */

const imagensOrdenadas = {
  imagens: { orderBy: [{ principal: "desc" as const }, { ordem: "asc" as const }] },
};

/** Árvore de categorias (pais com filhas) — para menu e filtros. */
export const getCategoriasArvore = cachear(
  () =>
    db.categoria.findMany({
      where: { parentId: null },
      orderBy: { ordem: "asc" },
      include: { filhas: { orderBy: { ordem: "asc" } } },
    }),
  ["categorias-arvore"],
  [TAG.categorias],
);

/** Todas as categorias em lista plana (admin, selects). */
export function getCategoriasPlanas() {
  return db.categoria.findMany({
    orderBy: [{ parentId: "asc" }, { ordem: "asc" }],
    include: { parent: true },
  });
}

/** Produtos em destaque para a home. */
export const getProdutosDestaque = cachear(
  (limite: number = 8) =>
    db.produto.findMany({
      where: { ativo: true, destaque: true },
      orderBy: [{ ordem: "asc" }, { criadoEm: "desc" }],
      take: limite,
      include: { ...imagensOrdenadas, seminovo: true, categoria: true },
    }),
  ["produtos-destaque"],
  [TAG.produtos],
);

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
/**
 * Leitura crua do catálogo por categoria — a parte que toca o banco.
 *
 * Só isto é cacheado. Busca textual e ordenação continuam fora do cache, em
 * memória: são baratas e variam a cada requisição, então incluí-las na chave
 * fragmentaria o cache em uma entrada por termo digitado, sem ganho nenhum.
 */
const lerCatalogoPorCategoria = cachear(
  async (categoriaSlug?: string) => {
    let categoriaIds: number[] | undefined;
    let categoria = null;

    if (categoriaSlug) {
      const cat = await db.categoria.findUnique({
        where: { slug: categoriaSlug },
        include: { filhas: { select: { id: true } } },
      });
      if (!cat) return { categoria: null, produtos: null };
      categoriaIds = [cat.id, ...cat.filhas.map((f) => f.id)];
      const { filhas: _filhas, ...semFilhas } = cat;
      categoria = semFilhas;
    }

    const produtos = await db.produto.findMany({
      where: {
        ativo: true,
        ...(categoriaIds ? { categoriaId: { in: categoriaIds } } : {}),
      },
      orderBy: [{ ordem: "asc" }, { criadoEm: "desc" }],
      include: { ...imagensOrdenadas, seminovo: true, categoria: true },
    });

    return { categoria, produtos };
  },
  ["catalogo-por-categoria"],
  [TAG.produtos, TAG.categorias],
);

export async function getProdutos(opts?: {
  categoria?: string;
  q?: string;
  ordenar?: OrdenarProdutos;
}) {
  const { categoria: categoriaSlug, q, ordenar = "relevancia" } = opts ?? {};

  const lido = await lerCatalogoPorCategoria(categoriaSlug);
  // Categoria pedida não existe.
  if (lido.produtos === null) return { categoria: null, produtos: [] };

  const { categoria } = lido;
  // Cópia: o array vem do cache e não pode ser ordenado no lugar.
  let produtos = [...lido.produtos];

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

  return { categoria, produtos };
}

export const getProduto = cachear(
  (slug: string) =>
    db.produto.findFirst({
      where: { slug, ativo: true },
      include: { ...imagensOrdenadas, seminovo: true, categoria: true },
    }),
  ["produto-por-slug"],
  [TAG.produtos],
);

/** Itens ativos que alimentam o configurador Monte seu Kit Celular. */
export const getProdutosParaKit = cachear(
  () =>
    db.produto.findMany({
      where: { ativo: true },
      orderBy: [{ ordem: "asc" }, { criadoEm: "desc" }],
      include: { ...imagensOrdenadas, categoria: true, seminovo: true },
    }),
  ["produtos-para-kit"],
  [TAG.produtos],
);

/** Vitrine de seminovos: só disponíveis (não vendidos). */
export const getSeminovos = cachear(
  () =>
    db.produto.findMany({
      where: { ativo: true, seminovo: { is: { vendido: false } } },
      orderBy: [{ ordem: "asc" }, { criadoEm: "desc" }],
      include: { ...imagensOrdenadas, seminovo: true, categoria: true },
    }),
  ["seminovos"],
  [TAG.seminovos, TAG.produtos],
);

export const getServicos = cachear(
  () =>
    db.servico.findMany({
      where: { ativo: true },
      orderBy: { ordem: "asc" },
    }),
  ["servicos"],
  [TAG.servicos],
);

export const getServico = cachear(
  (slug: string) => db.servico.findFirst({ where: { slug, ativo: true } }),
  ["servico-por-slug"],
  [TAG.servicos],
);

export type ProdutoComRelacoes = Awaited<ReturnType<typeof getProduto>>;
