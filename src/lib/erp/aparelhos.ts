import "server-only";

import { db } from "../db";

/**
 * Aparelhos individuais (ERP — IMEI/Número de Série).
 *
 * Complementa o ledger de quantidade: aqui cada unidade física é rastreada por
 * IMEI/serial, com status próprio. Consultas puras; a escrita vive em
 * acoes-aparelho.ts.
 */

export const STATUS_APARELHO = [
  { id: "estoque", rotulo: "Em estoque" },
  { id: "vendido", rotulo: "Vendido" },
  { id: "assistencia", rotulo: "Assistência" },
  { id: "devolvido", rotulo: "Devolvido" },
  { id: "perdido", rotulo: "Perdido/roubado" },
] as const;

export function rotuloStatus(id: string): string {
  return STATUS_APARELHO.find((s) => s.id === id)?.rotulo ?? id;
}

/** Aparelhos de um produto, do mais recente ao mais antigo. */
export function aparelhosDoProduto(produtoId: number) {
  return db.aparelho.findMany({
    where: { produtoId },
    orderBy: { criadoEm: "desc" },
    include: { cliente: { select: { id: true, nome: true } } },
  });
}

/** Busca por IMEI ou serial (consulta de garantia/procedência). */
export async function buscarAparelho(termo: string) {
  const t = termo.trim();
  if (!t) return null;
  return db.aparelho.findFirst({
    where: { OR: [{ imei: t }, { serial: t }] },
    include: {
      produto: { select: { id: true, nome: true, garantiaMeses: true } },
      cliente: { select: { id: true, nome: true, telefone: true } },
    },
  });
}

/** Contagem de aparelhos por status (para o dashboard/ficha). */
export async function contarAparelhosPorStatus(produtoId: number) {
  const linhas = await db.aparelho.groupBy({
    by: ["status"],
    where: { produtoId },
    _count: { _all: true },
  });
  const mapa: Record<string, number> = {};
  for (const l of linhas) mapa[l.status] = l._count._all;
  return mapa;
}
