"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { exigirPermissao } from "../auth/service";
import { auditar } from "../core/audit";
import { db } from "../db";
import { gerarSlug } from "../format";
import { empresaPadrao } from "./dados";
import { salvarMaterialAcademy } from "./materiais";
import { concederConquista, concederXpManual, emitirCertificado } from "./progresso";

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
  if (!["N1", "N2", "N3", "N4", "N5", "N6"].includes(nivel)) return { erro: "Nível inválido." };

  const empresa = await empresaPadrao();
  const slug = await slugUnicoTrilha(empresa.id, nome, id ?? undefined);
  const dados = {
    nome,
    nivel: nivel as "N1" | "N2" | "N3" | "N4" | "N5" | "N6",
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

// ──────────────────────────── Material (Biblioteca) ────────────────────────────

export async function acaoCriarMaterial(_estado: Estado, form: FormData): Promise<Estado> {
  const eu = await exigirPermissao("academy.conteudo.gerenciar");

  const titulo = String(form.get("titulo") ?? "").trim();
  if (titulo.length < 2) return { erro: "Informe o título do material." };

  const arquivo = form.get("arquivo");
  if (!(arquivo instanceof File) || arquivo.size === 0) return { erro: "Selecione um arquivo." };

  const trilhaId = Number(form.get("trilhaId") ?? 0) || null;
  const aulaId = Number(form.get("aulaId") ?? 0) || null;

  const resultado = await salvarMaterialAcademy(arquivo);
  if (!resultado.ok) return { erro: resultado.erro };

  const tipo = arquivo.name.split(".").pop()?.toLowerCase() ?? "arquivo";
  const material = await db.material.create({
    data: {
      titulo, tipo, url: resultado.url, tamanhoKb: resultado.tamanhoKb,
      trilhaId, aulaId, status: "PUBLICADO",
    },
  });

  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp",
    acao: "criar-material",
    entidade: "Material",
    entidadeId: material.id,
    depois: { titulo, tipo, trilhaId, aulaId },
  });

  revalidatePath("/erp/academy/materiais");
  return { ok: true };
}

export async function acaoArquivarMaterial(id: number) {
  const eu = await exigirPermissao("academy.conteudo.arquivar");
  await db.material.update({ where: { id }, data: { status: "ARQUIVADO" } });
  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp",
    acao: "arquivar-material",
    entidade: "Material",
    entidadeId: id,
  });
  revalidatePath("/erp/academy/materiais");
}

// ──────────────────────────── Pré-requisito ────────────────────────────

/** Substitui o conjunto de pré-requisitos da aula (a lista enviada é a lista final). */
export async function acaoDefinirPreRequisitos(_estado: Estado, form: FormData): Promise<Estado> {
  const eu = await exigirPermissao("academy.conteudo.gerenciar");

  const aulaId = Number(form.get("aulaId"));
  if (!aulaId) return { erro: "Aula inválida." };

  const dependeDeIds = form.getAll("dependeDe")
    .map((v) => Number(v))
    .filter((n) => Number.isInteger(n) && n !== aulaId);

  await db.preRequisito.deleteMany({ where: { aulaId } });
  if (dependeDeIds.length) {
    await db.preRequisito.createMany({
      data: dependeDeIds.map((dependeDeId) => ({ aulaId, dependeDeId })),
      skipDuplicates: true,
    });
  }

  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp", acao: "definir-pre-requisitos", entidade: "Aula", entidadeId: aulaId,
    depois: { dependeDeIds },
  });

  revalidatePath(`/erp/academy/aulas/${aulaId}`);
  return { ok: true };
}

// ──────────────────────────────── Quiz ────────────────────────────────

export async function acaoCriarQuiz(_estado: Estado, form: FormData): Promise<Estado> {
  const eu = await exigirPermissao("academy.conteudo.gerenciar");

  const aulaId = Number(form.get("aulaId"));
  if (!aulaId) return { erro: "Aula inválida." };
  const notaMinima = Math.min(100, Math.max(0, Number(form.get("notaMinima") ?? 70) || 70));
  const tentativasDia = Math.max(1, Number(form.get("tentativasDia") ?? 3) || 3);

  await db.quiz.upsert({
    where: { aulaId },
    update: { notaMinima, tentativasDia },
    create: { aulaId, notaMinima, tentativasDia },
  });

  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp", acao: "salvar-quiz", entidade: "Aula", entidadeId: aulaId,
    depois: { notaMinima, tentativasDia },
  });

  revalidatePath(`/erp/academy/aulas/${aulaId}`);
  return { ok: true };
}

export async function acaoCriarPergunta(_estado: Estado, form: FormData): Promise<Estado> {
  const eu = await exigirPermissao("academy.conteudo.gerenciar");

  const quizId = Number(form.get("quizId"));
  const aulaId = Number(form.get("aulaId"));
  const enunciado = String(form.get("enunciado") ?? "").trim();
  if (!quizId) return { erro: "Crie o quiz antes de adicionar perguntas." };
  if (enunciado.length < 3) return { erro: "Informe o enunciado da pergunta." };

  // Amarra "correta" ao índice ORIGINAL antes de filtrar em branco — senão uma
  // alternativa vazia no meio desloca o índice e marca a errada como certa.
  const corretaIdxBruto = Number(form.get("correta") ?? -1);
  const alternativas = form.getAll("alternativa")
    .map((v, i) => ({ texto: String(v).trim(), correta: i === corretaIdxBruto }))
    .filter((a) => a.texto.length > 0);
  if (alternativas.length < 2) return { erro: "Informe ao menos 2 alternativas." };
  if (!alternativas.some((a) => a.correta)) {
    return { erro: "A alternativa marcada como correta está em branco. Marque uma alternativa preenchida." };
  }

  const ordem = await db.quizPergunta.count({ where: { quizId } });
  const pergunta = await db.quizPergunta.create({
    data: {
      quizId, enunciado, ordem,
      alternativas: { create: alternativas },
    },
  });

  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp", acao: "criar-pergunta-quiz", entidade: "QuizPergunta", entidadeId: pergunta.id,
    depois: { enunciado, alternativas: alternativas.length },
  });

  revalidatePath(`/erp/academy/aulas/${aulaId}`);
  return { ok: true };
}

/** Exclusão real (não soft-delete): TentativaQuiz guarda só a nota, não a pergunta — nada se perde. */
export async function acaoExcluirPergunta(perguntaId: number, aulaId: number) {
  const eu = await exigirPermissao("academy.conteudo.gerenciar");
  await db.quizPergunta.delete({ where: { id: perguntaId } });
  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp", acao: "excluir-pergunta-quiz", entidade: "QuizPergunta", entidadeId: perguntaId,
  });
  revalidatePath(`/erp/academy/aulas/${aulaId}`);
}

// ─────────────────────────── Conquistas (CRUD) ───────────────────────────

async function slugUnicoConquista(nome: string): Promise<string> {
  const base = gerarSlug(nome) || "conquista";
  let slug = base, n = 1;
  while (await db.conquista.findUnique({ where: { slug } })) { n += 1; slug = `${base}-${n}`; }
  return slug;
}

export async function acaoSalvarConquista(_estado: Estado, form: FormData): Promise<Estado> {
  const eu = await exigirPermissao("academy.conteudo.gerenciar");

  const id = form.get("id") ? Number(form.get("id")) : null;
  const nome = String(form.get("nome") ?? "").trim();
  if (nome.length < 2) return { erro: "Informe o nome da conquista." };
  const criterioTipo = String(form.get("criterioTipo") ?? "").trim();
  if (!criterioTipo) return { erro: "Informe o tipo de critério." };

  const dados = {
    nome,
    descricao: String(form.get("descricao") ?? "").trim() || null,
    icone: String(form.get("icone") ?? "").trim() || null,
    criterioTipo,
    criterioValor: Number(form.get("criterioValor") ?? 0) || 0,
  };

  const salva = id
    ? await db.conquista.update({ where: { id }, data: dados })
    : await db.conquista.create({ data: { ...dados, slug: await slugUnicoConquista(nome) } });

  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp", acao: id ? "editar-conquista" : "criar-conquista", entidade: "Conquista", entidadeId: salva.id,
    depois: dados,
  });

  revalidatePath("/erp/academy/conquistas");
  return { ok: true };
}

/** Nunca exclui uma conquista já concedida — apagaria a conquista de quem ganhou. */
export async function acaoExcluirConquista(id: number) {
  const eu = await exigirPermissao("academy.conteudo.arquivar");
  const concedidas = await db.conquistaAluno.count({ where: { conquistaId: id } });
  if (concedidas > 0) return;
  await db.conquista.delete({ where: { id } });
  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp", acao: "excluir-conquista", entidade: "Conquista", entidadeId: id,
  });
  revalidatePath("/erp/academy/conquistas");
}

// ─────────────────────── Ações manuais sobre o aluno ───────────────────────

export async function acaoConcederXpAluno(_estado: Estado, form: FormData): Promise<Estado> {
  const eu = await exigirPermissao("academy.xp.conceder");

  const usuarioId = Number(form.get("usuarioId"));
  const xp = Number(form.get("xp"));
  if (!usuarioId) return { erro: "Aluno inválido." };
  if (!Number.isFinite(xp) || xp === 0) return { erro: "Informe um valor de XP diferente de zero." };

  const motivo = String(form.get("motivo") ?? "").trim();
  await concederXpManual(usuarioId, Math.round(xp));

  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp", acao: "conceder-xp-manual", entidade: "Usuario", entidadeId: usuarioId,
    depois: { xp: Math.round(xp), motivo: motivo || null },
  });

  revalidatePath(`/erp/alunos/${usuarioId}`);
  return { ok: true };
}

export async function acaoConcederConquistaAluno(_estado: Estado, form: FormData): Promise<Estado> {
  const eu = await exigirPermissao("academy.xp.conceder");

  const usuarioId = Number(form.get("usuarioId"));
  const conquistaId = Number(form.get("conquistaId"));
  if (!usuarioId || !conquistaId) return { erro: "Selecione o aluno e a conquista." };

  const conquista = await db.conquista.findUnique({ where: { id: conquistaId } });
  if (!conquista) return { erro: "Conquista não encontrada." };

  await concederConquista(usuarioId, conquista.slug);

  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp", acao: "conceder-conquista-manual", entidade: "Usuario", entidadeId: usuarioId,
    depois: { conquista: conquista.slug },
  });

  revalidatePath(`/erp/alunos/${usuarioId}`);
  return { ok: true };
}

export async function acaoEmitirCertificadoManual(_estado: Estado, form: FormData): Promise<Estado> {
  const eu = await exigirPermissao("academy.xp.conceder");

  const usuarioId = Number(form.get("usuarioId"));
  const trilhaId = Number(form.get("trilhaId"));
  if (!usuarioId || !trilhaId) return { erro: "Selecione o aluno e a trilha." };

  await emitirCertificado(usuarioId, trilhaId);

  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp", acao: "emitir-certificado-manual", entidade: "Usuario", entidadeId: usuarioId,
    depois: { trilhaId },
  });

  revalidatePath(`/erp/alunos/${usuarioId}`);
  return { ok: true };
}
