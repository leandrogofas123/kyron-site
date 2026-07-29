"use server";

import { revalidatePath } from "next/cache";

import { auditar } from "./core/audit";
import { db } from "./db";
import { exigirPermissao } from "./erp/auth";

const TIPOS = new Set([
  "whatsapp",
  "ligacao",
  "visita",
  "email",
  "chat_ia",
  "loja",
  "suporte",
  "observacao",
]);

type Estado = { erro?: string; ok?: boolean } | null;

/** Registra uma interação na timeline de um cliente. */
export async function registrarInteracaoCliente(
  clienteId: number,
  _estado: Estado,
  form: FormData,
): Promise<Estado> {
  const eu = await exigirPermissao("clientes.editar");

  const tipo = String(form.get("tipo") ?? "");
  const conteudo = String(form.get("conteudo") ?? "").trim() || null;
  if (!TIPOS.has(tipo)) return { erro: "Tipo de interação inválido." };
  if (!Number.isInteger(clienteId)) return { erro: "Cliente inválido." };

  await db.interacao.create({
    data: { tipo, conteudo, clienteId, autorId: eu.id, autorNome: eu.nome },
  });

  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp",
    acao: "registrar-interacao",
    entidade: "ClienteErp",
    entidadeId: clienteId,
    depois: { tipo },
  });

  revalidatePath(`/erp/clientes/${clienteId}`);
  return { ok: true };
}
