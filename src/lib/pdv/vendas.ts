import "server-only";

import { db } from "../db";

/** Venda com itens e cliente, para o popup de detalhe. */
export function obterVendaPorNumero(numero: number) {
  return db.venda.findUnique({
    where: { numero },
    include: {
      itens: true,
      cliente: { select: { id: true, nome: true } },
    },
  });
}
