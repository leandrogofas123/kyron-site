"use server";

import { revalidatePath } from "next/cache";

import { auditar } from "../core/audit";
import { db } from "../db";
import { exigirPermissao } from "./auth";

/** CRM de leads (assistente/orçamentos do site). Gate "clientes.editar". */

const VALIDOS = new Set(["novo", "respondido", "vendido", "perdido"]);

export async function acaoStatusLead(id: number, status: string): Promise<void> {
  const eu = await exigirPermissao("clientes.editar");
  if (!VALIDOS.has(status)) return;
  await db.lead.update({ where: { id }, data: { status } });
  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp",
    acao: "status-lead",
    entidade: "Lead",
    entidadeId: id,
    depois: { status },
  });
  revalidatePath("/erp/leads");
}
