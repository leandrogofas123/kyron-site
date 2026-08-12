import "server-only";

import { db } from "../db";
import { empresaPadrao } from "./dados";
import { nivelPorXp } from "./progresso";

/**
 * Leitura do conteúdo da Kyron Academy (V2) — lado do ALUNO.
 * Só enxerga o que está PUBLICADO. Progresso é sempre do usuário logado.
 */

export async function getTrilhasAluno(usuarioId: number) {
  const empresa = await empresaPadrao();
  const trilhas = await db.trilha.findMany({
    where: { empresaId: empresa.id, status: "PUBLICADO" },
    orderBy: { ordem: "asc" },
    include: {
      modulos: {
        where: { status: "PUBLICADO" },
        orderBy: { ordem: "asc" },
        include: { aulas: { where: { status: "PUBLICADO" }, orderBy: { ordem: "asc" } } },
      },
    },
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
    // Ordem real: aulas de todos os módulos, na ordem do módulo e depois da aula.
    const aulasEmOrdem = t.modulos.flatMap((m) => m.aulas);
    const total = aulasEmOrdem.length;
    const feitas = aulasEmOrdem.filter((a) => concluidasSet.has(a.id)).length;
    const proximaAula = aulasEmOrdem.find((a) => !concluidasSet.has(a.id)) ?? null;
    return {
      id: t.id, slug: t.slug, nome: t.nome, sigla: t.sigla, nivel: t.nivel,
      descricao: t.descricao, corHex: t.corHex, regiaoMapa: t.regiaoMapa,
      totalAulas: total, aulasConcluidas: feitas,
      percentual: total ? Math.round((feitas / total) * 100) : 0,
      proximaAulaSlug: proximaAula?.slug ?? null,
      proximaAulaTitulo: proximaAula?.titulo ?? null,
    };
  });
}

/** Conquistas do aluno: todas as definidas, marcando quais já foram ganhas. */
export async function getConquistasAluno(usuarioId: number) {
  const [todas, ganhas] = await Promise.all([
    db.conquista.findMany({ orderBy: { nome: "asc" } }),
    db.conquistaAluno.findMany({ where: { usuarioId } }),
  ]);
  const mapaGanhas = new Map(ganhas.map((g) => [g.conquistaId, g.conquistadoEm]));
  return todas
    .map((c) => ({ ...c, conquistada: mapaGanhas.has(c.id), conquistadoEm: mapaGanhas.get(c.id) ?? null }))
    .sort((a, b) => Number(b.conquistada) - Number(a.conquistada));
}

/** Perfil de XP/nível/streak — leitura pura, sem criar linha (uma visita não deve ter efeito colateral). */
export async function getPerfilAluno(usuarioId: number) {
  const perfil = await db.alunoPerfil.findUnique({ where: { usuarioId } });
  const xpTotal = perfil?.xpTotal ?? 0;
  return {
    xpTotal,
    nivel: perfil?.nivel ?? nivelPorXp(xpTotal),
    streakDias: perfil?.streakDias ?? 0,
  };
}

const ORIGEM_XP: Record<string, string> = {
  aula: "Aula concluída", modulo: "Módulo completo", trilha: "Trilha completa",
  quiz: "Quiz aprovado", streak: "Dia de estudo", manual: "Concedido pela equipe Kyron",
};

/** Histórico recente de XP — para a página /app/progresso. */
export async function getEventosXpAluno(usuarioId: number, limite = 15) {
  const eventos = await db.eventoXP.findMany({
    where: { usuarioId },
    orderBy: { criadoEm: "desc" },
    take: limite,
  });
  return eventos.map((e) => ({
    id: e.id, xp: e.xp, criadoEm: e.criadoEm,
    descricao: ORIGEM_XP[e.tipo] ?? e.tipo,
  }));
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

/** Materiais visíveis ao aluno: publicados, e se vinculados, o pai também publicado. */
export async function getMateriaisAluno() {
  return db.material.findMany({
    where: {
      status: "PUBLICADO",
      AND: [
        { OR: [{ trilhaId: null }, { trilha: { status: "PUBLICADO" } }] },
        { OR: [{ aulaId: null }, { aula: { status: "PUBLICADO" } }] },
      ],
    },
    orderBy: { criadoEm: "desc" },
    include: { trilha: { select: { nome: true } }, aula: { select: { titulo: true } } },
  });
}

export type NovidadeAluno = {
  id: string;
  titulo: string;
  resumo: string | null;
  tipoLabel: string;
  href: string;
  data: Date;
  eVideo: boolean;
};

/**
 * Feed "Novidades" do dashboard: aulas recém-publicadas (modelo novo) +
 * posts do Manual (modelo legado, ainda em uso em /manual e /erp/aulas),
 * unificados por data. Migração de conteúdo é gradual — não descarta o
 * legado, só deixa de ser a ÚNICA fonte.
 */
export async function getNovidadesAluno(limite = 6): Promise<NovidadeAluno[]> {
  const [aulas, posts] = await Promise.all([
    db.aula.findMany({
      where: { status: "PUBLICADO" },
      orderBy: { publicadoEm: "desc" },
      take: limite,
      select: { id: true, slug: true, titulo: true, resumo: true, tipo: true, publicadoEm: true, criadoEm: true },
    }),
    db.post.findMany({
      where: { publicado: true },
      orderBy: { criadoEm: "desc" },
      take: limite,
      select: { id: true, slug: true, titulo: true, resumo: true, youtubeId: true, criadoEm: true },
    }),
  ]);

  const itensAula: NovidadeAluno[] = aulas.map((a) => ({
    id: `aula-${a.id}`,
    titulo: a.titulo,
    resumo: a.resumo,
    tipoLabel: a.tipo === "VIDEO" ? "AULA EM VÍDEO" : a.tipo === "QUIZ" ? "AVALIAÇÃO" : "MATERIAL",
    href: `/app/aula/${a.slug}`,
    data: a.publicadoEm ?? a.criadoEm,
    eVideo: a.tipo === "VIDEO",
  }));
  const itensPost: NovidadeAluno[] = posts.map((p) => ({
    id: `post-${p.id}`,
    titulo: p.titulo,
    resumo: p.resumo,
    tipoLabel: p.youtubeId ? "AULA EM VÍDEO" : "MATERIAL PRÁTICO",
    href: `/app/${p.youtubeId ? "treinamentos" : "manuais"}/${p.slug}`,
    data: p.criadoEm,
    eVideo: Boolean(p.youtubeId),
  }));

  return [...itensAula, ...itensPost].sort((a, b) => b.data.getTime() - a.data.getTime()).slice(0, limite);
}
