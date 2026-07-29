import "server-only";

import { db } from "./db";
import { gerarSlug } from "./format";

/**
 * Marca como entidade (módulo Catalog).
 *
 * Antes "marca" era só texto em Produto. Aqui ela vira registro reutilizável —
 * sem forçar mudança no admin: `vincularMarca` faz upsert a partir do próprio
 * texto que o dono digita. Assim "Apple", "apple" e "APPLE" convergem para uma
 * marca só, habilitando filtro por marca e consistência.
 */

/** Garante a Marca a partir do rótulo e devolve seu id (ou null se vazio). */
export async function vincularMarca(rotulo: string | null): Promise<number | null> {
  const nome = rotulo?.trim();
  if (!nome) return null;
  const slug = gerarSlug(nome);
  if (!slug) return null;
  const marca = await db.marca.upsert({
    where: { slug },
    update: {}, // não sobrescreve o nome canônico já existente
    create: { slug, nome },
  });
  return marca.id;
}

/** Marcas ativas que têm ao menos um produto visível — para filtros/menu. */
export function marcasComProdutos() {
  return db.marca.findMany({
    where: { ativo: true, produtos: { some: { ativo: true, excluidoEm: null } } },
    orderBy: [{ ordem: "asc" }, { nome: "asc" }],
    select: { id: true, slug: true, nome: true, logo: true },
  });
}
