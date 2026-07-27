import "server-only";

import { db } from "../../db";
import type { ItemNfe } from "./parse-xml";

/**
 * Sugere produtos existentes para um item da nota — a trava contra duplicados.
 *
 * Ordem de força do sinal:
 *  1. EAN igual  → praticamente certo.
 *  2. Código do fornecedor = SKU/código interno.
 *  3. Similaridade textual (tokens em comum + trechos), nunca só o nome.
 * Cada sugestão traz o motivo, para o operador decidir com contexto.
 */

export type Sugestao = {
  produtoId: number;
  nome: string;
  quantidadeAtual: number;
  score: number; // 0..1
  motivo: string;
};

function normalizar(t: string): string {
  return t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(t: string): Set<string> {
  return new Set(normalizar(t).split(" ").filter((x) => x.length >= 2));
}

/** Jaccard entre conjuntos de tokens + bônus por número de modelo em comum. */
function similaridade(a: string, b: string): number {
  const ta = tokens(a);
  const tb = tokens(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const x of ta) if (tb.has(x)) inter++;
  const jaccard = inter / (ta.size + tb.size - inter);

  // Bônus: números (capacidade, modelo) coincidindo pesam bastante.
  const numsA = new Set([...ta].filter((x) => /\d/.test(x)));
  const numsB = new Set([...tb].filter((x) => /\d/.test(x)));
  let numMatch = 0;
  for (const n of numsA) if (numsB.has(n)) numMatch++;
  const bonus = numMatch > 0 ? Math.min(0.25, numMatch * 0.12) : 0;

  return Math.min(1, jaccard + bonus);
}

export type ProdutoIndice = {
  id: number;
  nome: string;
  ean: string | null;
  sku: string | null;
  codigoInterno: string | null;
  marca: string | null;
  modelo: string | null;
  quantidade: number;
};

export function carregarIndice(): Promise<ProdutoIndice[]> {
  return db.produto.findMany({
    where: { excluidoEm: null },
    select: {
      id: true,
      nome: true,
      ean: true,
      sku: true,
      codigoInterno: true,
      marca: true,
      modelo: true,
      quantidade: true,
    },
  });
}

const LIMIAR = 0.34; // abaixo disso não sugere — evita vínculo errado

export function sugerirPara(item: ItemNfe, indice: ProdutoIndice[]): Sugestao[] {
  const candidatos: Sugestao[] = [];

  for (const p of indice) {
    // 1. EAN
    if (item.ean && p.ean && item.ean === p.ean) {
      candidatos.push({
        produtoId: p.id,
        nome: p.nome,
        quantidadeAtual: p.quantidade,
        score: 1,
        motivo: "EAN igual",
      });
      continue;
    }
    // 2. Código do fornecedor = SKU / código interno
    const cod = item.codigoFornecedor?.trim().toLowerCase();
    if (cod && (p.sku?.toLowerCase() === cod || p.codigoInterno?.toLowerCase() === cod)) {
      candidatos.push({
        produtoId: p.id,
        nome: p.nome,
        quantidadeAtual: p.quantidade,
        score: 0.9,
        motivo: "Código do fornecedor",
      });
      continue;
    }
    // 3. Similaridade textual (nome + marca/modelo do cadastro)
    const alvo = `${p.nome} ${p.marca ?? ""} ${p.modelo ?? ""}`;
    const s = similaridade(item.descricao, alvo);
    if (s >= LIMIAR) {
      candidatos.push({
        produtoId: p.id,
        nome: p.nome,
        quantidadeAtual: p.quantidade,
        score: s,
        motivo: `Semelhança ${Math.round(s * 100)}%`,
      });
    }
  }

  return candidatos.sort((a, b) => b.score - a.score).slice(0, 4);
}
