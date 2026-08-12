"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { exigirPermissao } from "../auth/service";
import { auditar } from "../core/audit";
import { db } from "../db";
import { gerarSlug } from "../format";
import { empresaPadrao } from "./dados";

/**
 * Server Actions da Kyron Academy (V2) — administração em /erp/academy.
 *
 * Toda ação passa por `exigirPermissao` (permissão real, não decoração de UI)
 * e deixa rastro em `auditar()`. Excluir nunca existe aqui — só arquivar
 * (soft delete): conteúdo com Progresso vinculado não pode sumir do banco.
 */

type Estado = { erro?: string; ok?: boolean } | null;

async function slugUnicoTrilha(empresaId: number, nome: string, ignorarId?: number): Promise<string> {
  const base = gerarSlug(nome) || "trilha";
  let slug = base, n = 1;
  while (true) {
    const existente = await db.trilha.findUnique({ where: { empresaId_slug: { empresaId, slug } } });
    if (!existente || existente.id === ignorarId) return slug;
    n += 1; slug = `${base}-${n}`;
  }
}

async function slugUnicoModulo(trilhaId: number, nome: string, ignorarId?: number): Promise<string> {
  const base = gerarSlug(nome) || "modulo";
  let slug = base, n = 1;
  while (true) {
    const existente = await db.modulo.findUnique({ where: { trilhaId_slug: { trilhaId, slug } } });
    if (!existente || existente.id === ignorarId) return slug;
    n += 1; slug = `${base}-${n}`;
  }
}

async function slugUnicoAula(titulo: string, ignorarId?: number): Promise<string> {
  const base = gerarSlug(titulo) || "aula";
  let slug = base, n = 1;
  while (true) {
    const existente = await db.aula.findUnique({ where: { slug } });
    if (!existente || existente.id === ignorarId) return slug;
    n += 1; slug = `${base}-${n}`;
  }
}

// ──────────────────────────── Trilha ────────────────────────────

export async function acaoSalvarTrilha(_estado: Estado, form: FormData): Promise<Estado> {
  const eu = await exigirPermissao("academy.conteudo.gerenciar");

  const id = form.get("id") ? Number(form.get("id")) : null;
  const nome = String(form.get("nome") ?? "").trim();
  if (nome.length < 2) return { erro: "Informe o nome da trilha." };

  const nivel = String(form.get("nivel") ?? "N1");
  if (!["N1", "N2", "N3"].includes(nivel)) return { erro: "Nível inválido." };

  const empresa = await empresaPadrao();
  const slug = await slugUnicoTrilha(empresa.id, nome, id ?? undefined);
  const dados = {
    nome,
    nivel: nivel as "N1" | "N2" | "N3",
    sigla: String(form.get("sigla") ?? "").trim().toUpperCase() || null,
    descricao: String(form.get("descricao") ?? "").trim() || null,
    corHex: String(form.get("corHex") ?? "").trim() || null,
    regiaoMapa: String(form.get("regiaoMapa") ?? "").trim() || null,
    ordem: Number(form.get("ordem") ?? 0) || 0,
  };

  const salvo = id
    ? await db.trilha.update({ where: { id }, data: { ...dados, slug } })
    : await db.trilha.create({ data: { ...dados, slug, empresaId: empresa.id, status: "RASCUNHO" } });

  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp",
    acao: id ? "editar-trilha" : "criar-trilha",
    entidade: "Trilha",
    entidadeId: salvo.id,
    depois: dados,
  });

  revalidatePath("/erp/academy");
  redirect(`/erp/academy/trilhas/${salvo.id}`);
}

async function mudarStatusTrilha(id: number, status: "RASCUNHO" | "PUBLICADO" | "ARQUIVADO") {
  const acaoPermissao = status === "ARQUIVADO" ? "academy.conteudo.arquivar" : "academy.conteudo.publicar";
  const eu = await exigirPermissao(acaoPermissao);

  const dados: { status: typeof status; publicadoEm?: Date; arquivadoEm?: Date } = { status };
  if (status === "PUBLICADO") dados.publicadoEm = new Date();
  if (status === "ARQUIVADO") dados.arquivadoEm = new Date();

  await db.trilha.update({ where: { id }, data: dados });
  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp",
    acao: status === "PUBLICADO" ? "publicar-trilha" : status === "ARQUIVADO" ? "arquivar-trilha" : "despublicar-trilha",
    entidade: "Trilha",
    entidadeId: id,
  });
  revalidatePath("/erp/academy");
  revalidatePath(`/erp/academy/trilhas/${id}`);
}

export async function acaoPublicarTrilha(id: number) { await mudarStatusTrilha(id, "PUBLICADO"); }
export async function acaoDespublicarTrilha(id: number) { await mudarStatusTrilha(id, "RASCUNHO"); }
export async function acaoArquivarTrilha(id: number) { await mudarStatusTrilha(id, "ARQUIVADO"); }

// ──────────────────────────── Módulo ────────────────────────────

export async function acaoSalvarModulo(_estado: Estado, form: FormData): Promise<Estado> {
  const eu = await exigirPermissao("academy.conteudo.gerenciar");

  const id = form.get("id") ? Number(form.get("id")) : null;
  const trilhaId = Number(form.get("trilhaId"));
  const nome = String(form.get("nome") ?? "").trim();
  if (!trilhaId) return { erro: "Trilha inválida." };
  if (nome.length < 2) return { erro: "Informe o nome do módulo." };

  const slug = await slugUnicoModulo(trilhaId, nome, id ?? undefined);
  const dados = { nome, ordem: Number(form.get("ordem") ?? 0) || 0 };

  const salvo = id
    ? await db.modulo.update({ where: { id }, data: { ...dados, slug } })
    : await db.modulo.create({ data: { ...dados, slug, trilhaId, status: "RASCUNHO" } });

  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp",
    acao: id ? "editar-modulo" : "criar-modulo",
    entidade: "Modulo",
    entidadeId: salvo.id,
    depois: dados,
  });

  revalidatePath(`/erp/academy/trilhas/${trilhaId}`);
  return { ok: true };
}

async function mudarStatusModulo(id: number, trilhaId: number, status: "RASCUNHO" | "PUBLICADO" | "ARQUIVADO") {
  const acaoPermissao = status === "ARQUIVADO" ? "academy.conteudo.arquivar" : "academy.conteudo.publicar";
  const eu = await exigirPermissao(acaoPermissao);
  await db.modulo.update({ where: { id }, data: { status } });
  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp",
    acao: status === "PUBLICADO" ? "publicar-modulo" : status === "ARQUIVADO" ? "arquivar-modulo" : "despublicar-modulo",
    entidade: "Modulo",
    entidadeId: id,
  });
  revalidatePath(`/erp/academy/trilhas/${trilhaId}`);
}

export async function acaoPublicarModulo(id: number, trilhaId: number) { await mudarStatusModulo(id, trilhaId, "PUBLICADO"); }
export async function acaoDespublicarModulo(id: number, trilhaId: number) { await mudarStatusModulo(id, trilhaId, "RASCUNHO"); }
export async function acaoArquivarModulo(id: number, trilhaId: number) { await mudarStatusModulo(id, trilhaId, "ARQUIVADO"); }

// ───────────────────────────── Aula ─────────────────────────────

export async function acaoSalvarAulaAcademy(_estado: Estado, form: FormData): Promise<Estado> {
  const eu = await exigirPermissao("academy.conteudo.gerenciar");

  const id = form.get("id") ? Number(form.get("id")) : null;
  const moduloId = Number(form.get("moduloId"));
  const trilhaId = Number(form.get("trilhaId"));
  const titulo = String(form.get("titulo") ?? "").trim();
  if (!moduloId) return { erro: "Módulo inválido." };
  if (titulo.length < 2) return { erro: "Informe o título da aula." };

  const tipo = String(form.get("tipo") ?? "VIDEO");
  if (!["VIDEO", "TEXTO", "QUIZ", "PDF"].includes(tipo)) return { erro: "Tipo inválido." };

  const slug = await slugUnicoAula(titulo, id ?? undefined);
  const dados = {
    titulo,
    tipo: tipo as "VIDEO" | "TEXTO" | "QUIZ" | "PDF",
    resumo: String(form.get("resumo") ?? "").trim() || null,
    youtubeId: String(form.get("youtubeId") ?? "").trim() || null,
    conteudoMd: String(form.get("conteudoMd") ?? "").trim() || null,
    duracaoMin: Number(form.get("duracaoMin") ?? 0) || 0,
    xp: Number(form.get("xp") ?? 10) || 10,
    restrita: form.get("restrita") !== "off", // padrão: restrita
    ordem: Number(form.get("ordem") ?? 0) || 0,
  };

  const salvo = id
    ? await db.aula.update({ where: { id }, data: { ...dados, slug } })
    : await db.aula.create({ data: { ...dados, slug, moduloId, status: "RASCUNHO" } });

  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp",
    acao: id ? "editar-aula-academy" : "criar-aula-academy",
    entidade: "Aula",
    entidadeId: salvo.id,
    depois: { titulo, tipo: dados.tipo },
  });

  revalidatePath(`/erp/academy/trilhas/${trilhaId}`);
  return { ok: true };
}

async function mudarStatusAula(id: number, trilhaId: number, status: "RASCUNHO" | "PUBLICADO" | "ARQUIVADO") {
  const acaoPermissao = status === "ARQUIVADO" ? "academy.conteudo.arquivar" : "academy.conteudo.publicar";
  const eu = await exigirPermissao(acaoPermissao);

  const dados: { status: typeof status; publicadoEm?: Date; arquivadoEm?: Date } = { status };
  if (status === "PUBLICADO") dados.publicadoEm = new Date();
  if (status === "ARQUIVADO") dados.arquivadoEm = new Date();

  await db.aula.update({ where: { id }, data: dados });
  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp",
    acao: status === "PUBLICADO" ? "publicar-aula-academy" : status === "ARQUIVADO" ? "arquivar-aula-academy" : "despublicar-aula-academy",
    entidade: "Aula",
    entidadeId: id,
  });
  revalidatePath(`/erp/academy/trilhas/${trilhaId}`);
}

export async function acaoPublicarAulaAcademy(id: number, trilhaId: number) { await mudarStatusAula(id, trilhaId, "PUBLICADO"); }
export async function acaoDespublicarAulaAcademy(id: number, trilhaId: number) { await mudarStatusAula(id, trilhaId, "RASCUNHO"); }
export async function acaoArquivarAulaAcademy(id: number, trilhaId: number) { await mudarStatusAula(id, trilhaId, "ARQUIVADO"); }
