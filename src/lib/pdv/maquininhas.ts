import "server-only";

import { db } from "../db";

/**
 * Maquininhas de cartão (Orders/Financeiro). Taxas em basis points (100 = 1%).
 * O PDV usa `listarAtivas` (desativada não aparece) e `taxaDe` para descontar o
 * líquido na hora da venda.
 */

export const PARCELAS_MAX = 12;

export type Maquininha = {
  id: number;
  nome: string;
  ativo: boolean;
  taxaDebito: number;
  taxasCredito: Record<string, number>;
};

function parse(m: { taxasCredito: string }): Record<string, number> {
  try {
    const o = JSON.parse(m.taxasCredito) as Record<string, number>;
    return o && typeof o === "object" ? o : {};
  } catch {
    return {};
  }
}

function mapear(m: {
  id: number;
  nome: string;
  ativo: boolean;
  taxaDebito: number;
  taxasCredito: string;
}): Maquininha {
  return { id: m.id, nome: m.nome, ativo: m.ativo, taxaDebito: m.taxaDebito, taxasCredito: parse(m) };
}

export async function listarMaquininhas(): Promise<Maquininha[]> {
  const linhas = await db.maquininha.findMany({ orderBy: [{ ativo: "desc" }, { nome: "asc" }] });
  return linhas.map(mapear);
}

export async function listarAtivas(): Promise<Maquininha[]> {
  const linhas = await db.maquininha.findMany({
    where: { ativo: true },
    orderBy: { nome: "asc" },
  });
  return linhas.map(mapear);
}

/** Taxa (bps) de uma maquininha para débito ou crédito em N parcelas. */
export function taxaDe(m: Maquininha, tipo: "debito" | "credito", parcelas = 1): number {
  if (tipo === "debito") return m.taxaDebito;
  return m.taxasCredito[String(parcelas)] ?? m.taxasCredito["1"] ?? 0;
}

/** Aplica a taxa: retorna o líquido (centavos) que entra na conta. */
export function liquido(valorCentavos: number, bps: number): number {
  return Math.round(valorCentavos * (1 - bps / 10000));
}
