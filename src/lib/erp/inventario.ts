import "server-only";

import { db } from "../db";

/**
 * Inventário / conferência (ERP).
 *
 * Não inventa um novo histórico: a contagem vira um movimento de `ajuste` no
 * ledger — que já guarda operador, data e saldo antes/depois. Aqui só listamos
 * o que contar e calculamos a divergência na tela.
 */
export function produtosParaContagem() {
  return db.produto.findMany({
    where: { excluidoEm: null },
    orderBy: [{ nome: "asc" }],
    select: {
      id: true,
      nome: true,
      sku: true,
      codigoInterno: true,
      quantidade: true,
    },
  });
}
