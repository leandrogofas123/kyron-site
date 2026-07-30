import "server-only";

import { db } from "../db";

/**
 * Consultas do PDV (módulo Orders / Venda Rápida). Só leitura; a finalização e
 * as validações vivem em acoes.ts. Busca única multi-campo (nome/SKU/código/
 * EAN e, por IMEI/série, via Aparelho) — o operador digita ou bipa no mesmo lugar.
 */

export type ProdutoPDV = {
  id: number;
  nome: string;
  meta: string;
  preco: number; // centavos (vigente)
  custo: number; // centavos (precoCusto; 0 se desconhecido)
  quantidade: number;
  temImei: boolean;
  sku: string | null;
};

function metaProduto(p: {
  marca: string | null;
  cor: string | null;
  capacidade: string | null;
  categoria?: { nome: string } | null;
}): string {
  return [p.marca, p.capacidade, p.cor, p.categoria?.nome].filter(Boolean).join(" · ");
}

/** Busca produtos ativos por texto ou por IMEI/série (via Aparelho). */
export async function buscarProdutosPDV(termo: string, limite = 8): Promise<ProdutoPDV[]> {
  const t = termo.trim();
  if (t.length < 2) return [];

  const select = {
    id: true,
    nome: true,
    marca: true,
    cor: true,
    capacidade: true,
    preco: true,
    precoPromo: true,
    precoCusto: true,
    quantidade: true,
    sku: true,
    categoria: { select: { nome: true } },
    aparelhos: { select: { id: true }, take: 1 },
  } as const;

  const porTexto = await db.produto.findMany({
    where: {
      ativo: true,
      excluidoEm: null,
      OR: [
        { nome: { contains: t, mode: "insensitive" } },
        { sku: { contains: t, mode: "insensitive" } },
        { codigoInterno: { contains: t, mode: "insensitive" } },
        { ean: { contains: t, mode: "insensitive" } },
        { modelo: { contains: t, mode: "insensitive" } },
      ],
    },
    take: limite,
    orderBy: [{ destaque: "desc" }, { nome: "asc" }],
    select,
  });

  const encontrados = new Map<number, (typeof porTexto)[number]>();
  for (const p of porTexto) encontrados.set(p.id, p);

  // Por IMEI/série: acha a unidade e traz o produto dela.
  if (encontrados.size < limite) {
    const aparelho = await db.aparelho.findFirst({
      where: { status: "estoque", OR: [{ imei: t }, { serial: t }] },
      select: { produto: { select } },
    });
    if (aparelho?.produto) encontrados.set(aparelho.produto.id, aparelho.produto);
  }

  return [...encontrados.values()].slice(0, limite).map((p) => ({
    id: p.id,
    nome: p.nome,
    meta: metaProduto(p),
    preco: p.precoPromo && p.precoPromo > 0 ? p.precoPromo : p.preco,
    custo: p.precoCusto ?? 0,
    quantidade: p.quantidade,
    temImei: p.aparelhos.length > 0,
    sku: p.sku,
  }));
}

/** Vendedores/equipe para o select. */
export function vendedoresPDV() {
  return db.usuario.findMany({
    where: {
      ativo: true,
      papeis: { some: { papel: { chave: { in: ["ADMIN_MASTER", "ADMIN", "GERENTE", "VENDEDOR"] } } } },
    },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true },
  });
}

/** Clientes para busca/vínculo (limitado). */
export async function buscarClientesPDV(termo: string, limite = 6) {
  const t = termo.trim();
  if (t.length < 2) return [];
  return db.clienteErp.findMany({
    where: {
      excluidoEm: null,
      OR: [
        { nome: { contains: t, mode: "insensitive" } },
        { telefone: { contains: t } },
        { cpf: { contains: t } },
      ],
    },
    take: limite,
    orderBy: { nome: "asc" },
    select: { id: true, nome: true, telefone: true },
  });
}
