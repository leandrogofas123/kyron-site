import "server-only";

import { db } from "../db";

/** Clientes do ERP — exclusão lógica, como o resto do sistema. */
export function listarClientes(q?: string) {
  const termo = q?.trim();
  return db.clienteErp.findMany({
    where: {
      excluidoEm: null,
      ...(termo
        ? {
            OR: (["nome", "telefone", "email", "cpf", "cidade"] as const).map(
              (campo) => ({
                [campo]: { contains: termo, mode: "insensitive" as const },
              }),
            ),
          }
        : {}),
    },
    orderBy: { nome: "asc" },
    take: 300,
  });
}

export function obterCliente(id: number) {
  return db.clienteErp.findFirst({ where: { id, excluidoEm: null } });
}

/** Lista enxuta para o seletor na movimentação de venda. */
export function clientesParaSelecao() {
  return db.clienteErp.findMany({
    where: { excluidoEm: null },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true, telefone: true },
  });
}

/**
 * Histórico do cliente: o que ele levou, quando, e a garantia de cada item
 * (data da movimentação + meses de garantia do produto).
 */
export async function historicoCliente(clienteId: number) {
  const movimentacoes = await db.movimentacaoEstoque.findMany({
    where: { clienteId },
    orderBy: { criadoEm: "desc" },
    take: 100,
    include: {
      produto: { select: { id: true, nome: true, garantiaMeses: true, preco: true } },
      usuario: { select: { nome: true } },
    },
  });

  return movimentacoes.map((m) => {
    let garantiaAte: Date | null = null;
    const meses = m.produto.garantiaMeses ?? 0;
    if (m.tipo === "venda" && meses > 0) {
      garantiaAte = new Date(m.criadoEm);
      garantiaAte.setMonth(garantiaAte.getMonth() + meses);
    }
    return { ...m, garantiaAte };
  });
}
