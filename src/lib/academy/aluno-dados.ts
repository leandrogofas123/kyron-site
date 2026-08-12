import "server-only";

import { db } from "../db";
import { empresaPadrao } from "./dados";

/**
 * Leitura do conteúdo da Kyron Academy (V2) — lado do ALUNO.
 * Só enxerga o que está PUBLICADO. Progresso é sempre do usuário logado.
 */

export async function getTrilhasAluno(usuarioId: number) {
  const empresa = await empresaPadrao();
  const trilhas = await db.trilha.findMany({
    where: { empresaId: empresa.id, status: "PUBLICADO" },
    orderBy: { ordem: "asc" },
    include: { modulos: { where: { status: "PUBLICADO" }, include: { aulas: { where: { status: "PUBLICADO" } } } } },
  });

  const todasAulaIds = trilhas.flatMap((t) => t.modulos.flatMap((m) => m.aulas.map((a) => a.id)));
  const concluidas = todasAulaIds.length
    ? await db.progresso.findMany({
        where: { usuarioId, aulaId: { in: todasAulaIds }, status: "CONCLUIDA" },
        select: { aulaId: true },
      })
    : [];
  const concluidasSet = new Set(concluidas.map((c) => c.aulaId));

  return trilhas.map((t) => {
    const aulaIds = t.modulos.flatMap((m) => m.aulas.map((a) => a.id));
    const total = aulaIds.length;
    const feitas = aulaIds.filter((id) => concluidasSet.has(id)).length;
    return {
      id: t.id, slug: t.slug, nome: t.nome, sigla: t.sigla, nivel: t.nivel,
      descricao: t.descricao, corHex: t.corHex, regiaoMapa: t.regiaoMapa,
      totalAulas: total, aulasConcluidas: feitas,
      percentual: total ? Math.round((feitas / total) * 100) : 0,
    };
  });
}

export async function getTrilhaAluno(slug: string, usuarioId: number) {
  const empresa = await empresaPadrao();
  const trilha = await db.trilha.findFirst({
    where: { empresaId: empresa.id, slug, status: "PUBLICADO" },
    include: {
      modulos: {
        where: { status: "PUBLICADO" },
        orderBy: { ordem: "asc" },
        include: { aulas: { where: { status: "PUBLICADO" }, orderBy: { ordem: "asc" } } },
      },
    },
  });
  if (!trilha) return null;

  const aulaIds = trilha.modulos.flatMap((m) => m.aulas.map((a) => a.id));
  const progresso = aulaIds.length
    ? await db.progresso.findMany({ where: { usuarioId, aulaId: { in: aulaIds } } })
    : [];
  const porAula = new Map(progresso.map((p) => [p.aulaId, p]));

  return {
    ...trilha,
    modulos: trilha.modulos.map((m) => ({
      ...m,
      aulas: m.aulas.map((a) => ({ ...a, progresso: porAula.get(a.id) ?? null })),
    })),
  };
}

export async function getAulaAluno(slug: string, usuarioId: number) {
  const aula = await db.aula.findFirst({
    where: { slug, status: "PUBLICADO" },
    include: {
      modulo: { include: { trilha: true } },
      preRequisitos: { include: { dependeDe: { select: { id: true, titulo: true, slug: true } } } },
      quiz: { include: { perguntas: { include: { alternativas: true }, orderBy: { ordem: "asc" } } } },
    },
  });
  if (!aula) return null;

  const dependeDeIds = aula.preRequisitos.map((p) => p.dependeDeId);
  const concluidasPreReq = dependeDeIds.length
    ? await db.progresso.findMany({
        where: { usuarioId, aulaId: { in: dependeDeIds }, status: "CONCLUIDA" },
        select: { aulaId: true },
      })
    : [];
  const concluidasSet = new Set(concluidasPreReq.map((c) => c.aulaId));
  const pendente = aula.preRequisitos.find((p) => !concluidasSet.has(p.dependeDeId));

  const progresso = await db.progresso.findUnique({ where: { usuarioId_aulaId: { usuarioId, aulaId: aula.id } } });

  // Nunca envia qual alternativa é correta para o cliente.
  const quiz = aula.quiz
    ? {
        id: aula.quiz.id,
        notaMinima: aula.quiz.notaMinima,
        perguntas: aula.quiz.perguntas.map((p) => ({
          id: p.id, enunciado: p.enunciado,
          alternativas: p.alternativas.map((alt) => ({ id: alt.id, texto: alt.texto })),
        })),
      }
    : null;

  return {
    id: aula.id, slug: aula.slug, titulo: aula.titulo, resumo: aula.resumo, tipo: aula.tipo,
    youtubeId: aula.youtubeId, conteudoMd: aula.conteudoMd, duracaoMin: aula.duracaoMin, xp: aula.xp,
    trilha: { slug: aula.modulo.trilha.slug, nome: aula.modulo.trilha.nome },
    modulo: { nome: aula.modulo.nome },
    progresso,
    quiz,
    bloqueadaPor: pendente ? pendente.dependeDe : null,
  };
}
