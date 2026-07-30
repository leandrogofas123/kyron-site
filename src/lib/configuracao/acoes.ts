"use server";

import { revalidatePath } from "next/cache";

import { auditar } from "../core/audit";
import { db } from "../db";
import { exigirPermissao } from "../erp/auth";
import { CHAVES, invalidarConfig } from "./config";

type Estado = { erro?: string; ok?: boolean } | null;

async function gravar(chave: string, valor: string) {
  await db.configuracao.upsert({
    where: { chave },
    update: { valor },
    create: { chave, valor },
  });
}

/** Salva as configurações da loja. Gate na permissão financeiro (admin/gerente). */
export async function acaoSalvarConfig(_estado: Estado, form: FormData): Promise<Estado> {
  const eu = await exigirPermissao("financeiro");

  const avisoAtivo = form.get("aviso_ativo") === "on" ? "1" : "0";
  const avisoTexto = String(form.get("aviso_texto") ?? "").trim().slice(0, 240);
  const horario = String(form.get("horario") ?? "").trim().slice(0, 240);

  await Promise.all([
    gravar(CHAVES.avisoAtivo, avisoAtivo),
    gravar(CHAVES.avisoTexto, avisoTexto),
    gravar(CHAVES.horario, horario),
  ]);

  invalidarConfig();

  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "admin",
    acao: "salvar-config",
    entidade: "Configuracao",
    depois: { avisoAtivo, temAviso: Boolean(avisoTexto) },
  });

  // O aviso aparece no site inteiro; revalida a home e as rotas de conteúdo.
  revalidatePath("/", "layout");
  revalidatePath("/erp/configuracoes");
  return { ok: true };
}
