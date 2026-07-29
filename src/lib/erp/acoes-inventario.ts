"use server";

import { revalidatePath } from "next/cache";

import { exigirPermissao } from "./auth";
import { movimentarEstoque } from "./estoque";

type Estado = { erro?: string; ok?: boolean; saldo?: number } | null;

/**
 * Aplica a contagem de um produto: registra um `ajuste` que leva o saldo ao
 * valor contado. O ledger guarda saldo antes/depois e o operador — a
 * divergência fica auditável sem tabela nova.
 */
export async function acaoAplicarContagem(
  produtoId: number,
  contado: number,
): Promise<Estado> {
  const eu = await exigirPermissao("estoque.movimentar");
  if (!Number.isInteger(produtoId)) return { erro: "Produto inválido." };
  if (!Number.isInteger(contado) || contado < 0) {
    return { erro: "Quantidade contada inválida." };
  }

  const r = await movimentarEstoque({
    produtoId,
    tipo: "ajuste",
    quantidade: contado,
    motivo: "Inventário / conferência",
    usuarioId: eu.id,
  });
  if (!r.ok) return { erro: r.erro };

  revalidatePath("/erp/inventario");
  revalidatePath("/erp/estoque");
  revalidatePath("/erp/produtos");
  revalidatePath("/erp");
  return { ok: true, saldo: r.saldo };
}
