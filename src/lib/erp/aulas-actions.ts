"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auditar } from "../core/audit";
import { db } from "../db";
import { gerarSlug } from "../format";
import { extrairYoutubeId } from "../manual";
import { exigirPermissao } from "./auth";

/**
 * Manual de Instalação (posts e aulas) DENTRO do ERP. Reaproveita os utilitários
 * puros (extrairYoutubeId, gerarSlug) e o mesmo modelo Post do site — a aula
 * publicada aqui aparece em /manual na hora (revalidate). Gate por permissão do
 * ERP ("aulas"), com auditoria.
 */

type Estado = { erro?: string } | null;

async function slugUnicoPost(titulo: string, ignorarId?: number): Promise<string> {
  const base = gerarSlug(titulo) || "aula";
  let slug = base;
  let n = 1;
  while (true) {
    const existente = await db.post.findUnique({ where: { slug } });
    if (!existente || existente.id === ignorarId) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

export async function acaoSalvarAula(_estado: Estado, form: FormData): Promise<Estado> {
  const eu = await exigirPermissao("aulas");

  const id = form.get("id") ? Number(form.get("id")) : null;
  const titulo = String(form.get("titulo") ?? "").trim();
  if (titulo.length < 2) return { erro: "Informe o título." };

  const youtubeBruto = String(form.get("youtube") ?? "").trim();
  const youtubeId = youtubeBruto ? extrairYoutubeId(youtubeBruto) : null;
  if (youtubeBruto && !youtubeId) {
    return { erro: "Link do YouTube inválido. Cole a URL do vídeo ou o ID." };
  }

  const dados = {
    titulo,
    resumo: String(form.get("resumo") ?? "").trim() || null,
    conteudo: String(form.get("conteudo") ?? "").trim() || null,
    youtubeId,
    restrito: form.get("restrito") === "on",
    publicado: form.get("publicado") === "on",
  };

  const slug = await slugUnicoPost(titulo, id ?? undefined);
  const salvo = id
    ? await db.post.update({ where: { id }, data: { ...dados, slug } })
    : await db.post.create({ data: { ...dados, slug } });

  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp",
    acao: id ? "editar-aula" : "criar-aula",
    entidade: "Post",
    entidadeId: salvo.id,
    depois: { titulo, aula: !!youtubeId, publicado: dados.publicado },
  });

  revalidatePath("/erp/aulas");
  revalidatePath("/manual");
  redirect("/erp/aulas");
}

export async function acaoAlternarAulaPublicado(id: number, publicado: boolean): Promise<void> {
  const eu = await exigirPermissao("aulas");
  await db.post.update({ where: { id }, data: { publicado } });
  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp",
    acao: publicado ? "publicar-aula" : "despublicar-aula",
    entidade: "Post",
    entidadeId: id,
  });
  revalidatePath("/erp/aulas");
  revalidatePath("/manual");
}

export async function acaoExcluirAula(id: number): Promise<void> {
  const eu = await exigirPermissao("aulas");
  await db.post.delete({ where: { id } });
  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp",
    acao: "excluir-aula",
    entidade: "Post",
    entidadeId: id,
  });
  revalidatePath("/erp/aulas");
  revalidatePath("/manual");
}
