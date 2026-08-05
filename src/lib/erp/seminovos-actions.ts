"use server";

import { revalidatePath } from "next/cache";

import { auditar } from "../core/audit";
import { db } from "../db";
import { exigirPermissao } from "./auth";

/** Marcar/desmarcar um seminovo como vendido. Gate "produtos.editar". */

export async function acaoMarcarVendido(produtoId: number, vendido: boolean): Promise<void> {
  const eu = await exigirPermissao("produtos.editar");
  await db.seminovo.update({ where: { produtoId }, data: { vendido } });
  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp",
    acao: vendido ? "seminovo-vendido" : "seminovo-reativado",
    entidade: "Seminovo",
    entidadeId: produtoId,
  });
  revalidatePath("/erp/produtos");
  revalidatePath("/seminovos");
  revalidatePath("/");
}
