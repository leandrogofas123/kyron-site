import "server-only";

import { db } from "../db";

/**
 * Listagem de vendas (módulo Orders/Vendas). Consulta única reutilizada pelo
 * módulo Vendas e pelo Dashboard. Opcionalmente filtra por período no banco;
 * o filtro fino por coluna acontece na tabela (cliente), sobre este resultado.
 */
export type VendaLinha = {
  numero: number;
  cliente: string;
  vendedor: string | null;
  data: string; // ISO
  itens: string;
  total: number; // centavos
  forma: string;
  status: string;
};

export async function listarVendas(opts?: {
  inicio?: Date;
  fim?: Date;
  limite?: number;
}): Promise<VendaLinha[]> {
  const criadoEm =
    opts?.inicio || opts?.fim
      ? {
          ...(opts.inicio ? { gte: opts.inicio } : {}),
          ...(opts.fim ? { lte: opts.fim } : {}),
        }
      : undefined;

  const vendas = await db.venda.findMany({
    where: criadoEm ? { criadoEm } : {},
    orderBy: { criadoEm: "desc" },
    take: opts?.limite ?? 500,
    include: {
      cliente: { select: { nome: true } },
      itens: { select: { nome: true, quantidade: true } },
    },
  });

  return vendas.map((v) => ({
    numero: v.numero,
    cliente: v.cliente?.nome ?? "Consumidor",
    vendedor: v.vendedorNome,
    data: v.criadoEm.toISOString(),
    itens: v.itens.map((i) => `${i.quantidade}× ${i.nome}`).join(", ") || "—",
    total: v.total,
    forma: v.forma,
    status: v.status,
  }));
}
