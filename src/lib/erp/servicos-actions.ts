"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auditar } from "../core/audit";
import { db } from "../db";
import { gerarSlug, parsePreco } from "../format";
import { exigirPermissao } from "./auth";

/** Catálogo de serviços (mostrado em /servicos). Gate "produtos.editar". */

type Estado = { erro?: string } | null;

async function slugUnicoServico(nome: string, ignorarId?: number): Promise<string> {
  const base = gerarSlug(nome) || "servico";
  let slug = base;
  let n = 1;
  while (true) {
    const existente = await db.servico.findUnique({ where: { slug } });
    if (!existente || existente.id === ignorarId) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

export async function acaoSalvarServico(_estado: Estado, form: FormData): Promise<Estado> {
  const eu = await exigirPermissao("produtos.editar");

  const id = form.get("id") ? Number(form.get("id")) : null;
  const nome = String(form.get("nome") ?? "").trim();
  if (nome.length < 2) return { erro: "Informe o nome do serviço." };

  const precoRaw = String(form.get("precoAPartirDe") ?? "").trim();
  const dados = {
    nome,
    descricao: String(form.get("descricao") ?? "").trim() || null,
    precoAPartirDe: precoRaw ? parsePreco(precoRaw) : null,
    atendeEmDomicilio: form.get("atendeEmDomicilio") === "on",
    tempoMedio: String(form.get("tempoMedio") ?? "").trim() || null,
    ativo: form.get("ativo") !== "off",
  };

  const slug = await slugUnicoServico(nome, id ?? undefined);
  const salvo = id
    ? await db.servico.update({ where: { id }, data: { ...dados, slug } })
    : await db.servico.create({ data: { ...dados, slug } });

  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp",
    acao: id ? "editar-servico" : "criar-servico",
    entidade: "Servico",
    entidadeId: salvo.id,
    depois: { nome, ativo: dados.ativo },
  });

  revalidatePath("/erp/servicos");
  revalidatePath("/servicos");
  redirect("/erp/servicos");
}
