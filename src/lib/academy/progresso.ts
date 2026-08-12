import "server-only";

import { db } from "../db";

/**
 * Progresso, XP e streak do aluno (Kyron Academy V2).
 *
 * Regras não negociáveis (docs/KYRON-ACADEMY-V2-ESTRUTURA.md §2 e §6):
 * - XP nasce SEMPRE de EventoXP (ledger). Nunca somar direto no perfil.
 * - Concluir aula exige ≥90% assistido (antifraude: clique sem tempo é rejeitado).
 * - Streak: 1 congelamento por mês; XP de "dia com atividade" só 1x/dia.
 */

export const NIVEIS = [
  { nome: "Recruta", minXp: 0 },
  { nome: "Operador", minXp: 200 },
  { nome: "Especialista", minXp: 600 },
  { nome: "Hunter", minXp: 1200 },
] as const;

export function nivelPorXp(xp: number): string {
  let atual: string = NIVEIS[0].nome;
  for (const n of NIVEIS) if (xp >= n.minXp) atual = n.nome;
  return atual;
}

const mesmoDia = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const diaSeguinte = (a: Date, b: Date) => {
  const prox = new Date(a);
  prox.setDate(prox.getDate() + 1);
  return mesmoDia(prox, b);
};

/** Garante que o perfil existe; devolve-o. */
async function perfilDoAluno(usuarioId: number) {
  return db.alunoPerfil.upsert({
    where: { usuarioId },
    update: {},
    create: { usuarioId },
  });
}

/** Concede XP via ledger e atualiza o cache do perfil (xpTotal, nível). */
async function concederXp(usuarioId: number, tipo: string, xp: number, refTipo?: string, refId?: number) {
  await db.eventoXP.create({ data: { usuarioId, tipo, xp, refTipo, refId } });
  const perfil = await perfilDoAluno(usuarioId);
  const xpTotal = perfil.xpTotal + xp;
  await db.alunoPerfil.update({
    where: { usuarioId },
    data: { xpTotal, nivel: nivelPorXp(xpTotal) },
  });
}

/**
 * Marca atividade do dia: streak +1 (dia seguinte), reset (dia não seguinte)
 * ou congelamento (1x/mês, quando faltou 1 dia). Concede +5 XP na 1ª
 * atividade do dia, com bônus ×1,2 a partir de 7 dias seguidos.
 */
async function marcarAtividadeDoDia(usuarioId: number) {
  const perfil = await perfilDoAluno(usuarioId);
  const agora = new Date();
  if (perfil.ultimoAcessoEm && mesmoDia(perfil.ultimoAcessoEm, agora)) return; // já contabilizado hoje

  let streak = perfil.streakDias;
  if (perfil.ultimoAcessoEm && diaSeguinte(perfil.ultimoAcessoEm, agora)) {
    streak += 1;
  } else if (
    perfil.ultimoAcessoEm &&
    perfil.congelaStreakAte &&
    perfil.congelaStreakAte >= agora &&
    !mesmoDia(perfil.ultimoAcessoEm, agora)
  ) {
    // Congelamento ativo: mantém a sequência mesmo com 1 dia de furo.
    streak += 1;
  } else if (perfil.ultimoAcessoEm) {
    streak = 1; // furou sem congelamento: reinicia
  } else {
    streak = 1; // primeira atividade
  }

  const xpDia = streak >= 7 ? Math.round(5 * 1.2) : 5;
  await db.alunoPerfil.update({
    where: { usuarioId },
    data: { streakDias: streak, ultimoAcessoEm: agora },
  });
  await concederXp(usuarioId, "streak", xpDia);
}

export async function registrarHeartbeat(usuarioId: number, aulaId: number, segundos: number) {
  const aula = await db.aula.findUnique({ where: { id: aulaId }, select: { duracaoMin: true, status: true } });
  if (!aula || aula.status !== "PUBLICADO") return null;

  const segundosTotais = Math.max(0, Math.floor(segundos));
  const duracaoSeg = Math.max(1, aula.duracaoMin * 60);
  const percentual = Math.min(100, Math.round((segundosTotais / duracaoSeg) * 100));

  const existente = await db.progresso.findUnique({ where: { usuarioId_aulaId: { usuarioId, aulaId } } });
  const jaConcluida = existente?.status === "CONCLUIDA";

  await db.progresso.upsert({
    where: { usuarioId_aulaId: { usuarioId, aulaId } },
    update: jaConcluida
      ? {} // não retrocede status nem reduz o assistido de uma aula já concluída
      : {
          segundosAssistidos: Math.max(existente?.segundosAssistidos ?? 0, segundosTotais),
          percentual: Math.max(existente?.percentual ?? 0, percentual),
          status: "EM_ANDAMENTO",
        },
    create: {
      usuarioId, aulaId,
      segundosAssistidos: segundosTotais, percentual, status: "EM_ANDAMENTO",
    },
  });

  await marcarAtividadeDoDia(usuarioId);
  return { percentual };
}

export type ResultadoConclusao = { ok: true; xpGanho: number } | { ok: false; motivo: string };

/** Conclui a aula. Vídeo exige ≥90% assistido (heartbeat); os demais formatos aceitam o clique direto. */
export async function concluirAula(usuarioId: number, aulaId: number): Promise<ResultadoConclusao> {
  const aula = await db.aula.findUnique({ where: { id: aulaId } });
  if (!aula || aula.status !== "PUBLICADO") return { ok: false, motivo: "Aula não disponível." };

  const existente = await db.progresso.findUnique({ where: { usuarioId_aulaId: { usuarioId, aulaId } } });
  if (existente?.status === "CONCLUIDA") return { ok: true, xpGanho: 0 }; // idempotente

  if (aula.tipo === "VIDEO" && (existente?.percentual ?? 0) < 90) {
    return { ok: false, motivo: "Assista ao menos 90% do vídeo para concluir." };
  }

  await db.progresso.upsert({
    where: { usuarioId_aulaId: { usuarioId, aulaId } },
    update: { status: "CONCLUIDA", percentual: 100, concluidoEm: new Date() },
    create: { usuarioId, aulaId, status: "CONCLUIDA", percentual: 100, concluidoEm: new Date(), segundosAssistidos: 0 },
  });

  await concederXp(usuarioId, "aula", aula.xp, "Aula", aula.id);
  await marcarAtividadeDoDia(usuarioId);
  await verificarModuloETrilhaCompletos(usuarioId, aula.moduloId);
  await verificarConquistas(usuarioId);

  return { ok: true, xpGanho: aula.xp };
}

/** Bônus de +30 XP ao concluir todas as aulas publicadas de um módulo, e +100 (+certificado) ao concluir a trilha. */
async function verificarModuloETrilhaCompletos(usuarioId: number, moduloId: number) {
  const modulo = await db.modulo.findUnique({
    where: { id: moduloId },
    include: { aulas: { where: { status: "PUBLICADO" } }, trilha: true },
  });
  if (!modulo || modulo.aulas.length === 0) return;

  const progressos = await db.progresso.findMany({
    where: { usuarioId, aulaId: { in: modulo.aulas.map((a) => a.id) }, status: "CONCLUIDA" },
  });
  if (progressos.length < modulo.aulas.length) return;

  const jaBonificado = await db.eventoXP.findFirst({
    where: { usuarioId, tipo: "modulo", refTipo: "Modulo", refId: moduloId },
  });
  if (!jaBonificado) await concederXp(usuarioId, "modulo", 30, "Modulo", moduloId);

  // trilha completa?
  const modulosDaTrilha = await db.modulo.findMany({
    where: { trilhaId: modulo.trilhaId, status: "PUBLICADO" },
    include: { aulas: { where: { status: "PUBLICADO" } } },
  });
  const todasAulas = modulosDaTrilha.flatMap((m) => m.aulas);
  if (todasAulas.length === 0) return;

  const concluidasNaTrilha = await db.progresso.count({
    where: { usuarioId, aulaId: { in: todasAulas.map((a) => a.id) }, status: "CONCLUIDA" },
  });
  if (concluidasNaTrilha < todasAulas.length) return;

  const jaBonificadaTrilha = await db.eventoXP.findFirst({
    where: { usuarioId, tipo: "trilha", refTipo: "Trilha", refId: modulo.trilhaId },
  });
  if (!jaBonificadaTrilha) {
    await concederXp(usuarioId, "trilha", 100, "Trilha", modulo.trilhaId);
    await emitirCertificado(usuarioId, modulo.trilhaId);
    const trilhasConcluidas = await db.certificado.count({ where: { usuarioId } });
    await concederConquistasPorCriterio(usuarioId, "trilha-completa", trilhasConcluidas);
  }
}

/** Idempotente: se já existe certificado para essa trilha, não duplica. */
export async function emitirCertificado(usuarioId: number, trilhaId: number) {
  const existente = await db.certificado.findUnique({ where: { usuarioId_trilhaId: { usuarioId, trilhaId } } });
  if (existente) return existente;
  const codigo = `KY-${trilhaId}-${usuarioId}-${Date.now().toString(36).toUpperCase()}`;
  return db.certificado.create({ data: { usuarioId, trilhaId, codigo } });
}

/** Concede XP fora do fluxo automático (override do admin — ver src/lib/academy/acoes.ts). */
export async function concederXpManual(usuarioId: number, xp: number) {
  await concederXp(usuarioId, "manual", xp);
}

export async function concederConquistaPorId(usuarioId: number, conquistaId: number) {
  await db.conquistaAluno.upsert({
    where: { usuarioId_conquistaId: { usuarioId, conquistaId } },
    update: {},
    create: { usuarioId, conquistaId },
  });
}

export async function concederConquista(usuarioId: number, slug: string) {
  const conquista = await db.conquista.findUnique({ where: { slug } });
  if (conquista) await concederConquistaPorId(usuarioId, conquista.id);
}

/**
 * Motor genérico: concede TODA conquista do tipo cujo `criterioValor` já foi
 * atingido — não só as 7 semeadas. Uma conquista nova criada pela interface
 * (/erp/academy/conquistas) é avaliada aqui automaticamente, sem precisar
 * mexer em código.
 */
async function concederConquistasPorCriterio(usuarioId: number, criterioTipo: string, valorAtual: number) {
  const candidatas = await db.conquista.findMany({ where: { criterioTipo, criterioValor: { lte: valorAtual } } });
  for (const c of candidatas) await concederConquistaPorId(usuarioId, c.id);
}

/** Conquistas avaliadas a cada conclusão de aula. */
async function verificarConquistas(usuarioId: number) {
  const totalConcluidas = await db.progresso.count({ where: { usuarioId, status: "CONCLUIDA" } });
  await concederConquistasPorCriterio(usuarioId, "primeira-aula", totalConcluidas);

  const hoje = new Date();
  const inicioDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const noDia = await db.progresso.count({
    where: { usuarioId, status: "CONCLUIDA", concluidoEm: { gte: inicioDia } },
  });
  await concederConquistasPorCriterio(usuarioId, "aulas-dia", noDia);

  const perfil = await perfilDoAluno(usuarioId);
  await concederConquistasPorCriterio(usuarioId, "streak", perfil.streakDias);
}

/** Nota do quiz e antifraude: no máximo N tentativas por dia. */
export async function responderQuiz(
  usuarioId: number,
  quizId: number,
  respostas: Record<number, number>, // perguntaId -> alternativaId
): Promise<{ ok: true; nota: number; aprovado: boolean } | { ok: false; motivo: string }> {
  const quiz = await db.quiz.findUnique({
    where: { id: quizId },
    include: { perguntas: { include: { alternativas: true } }, aula: true },
  });
  if (!quiz) return { ok: false, motivo: "Quiz não encontrado." };

  const inicioDia = new Date(); inicioDia.setHours(0, 0, 0, 0);
  const tentativasHoje = await db.tentativaQuiz.count({
    where: { usuarioId, quizId, criadoEm: { gte: inicioDia } },
  });
  if (tentativasHoje >= quiz.tentativasDia) {
    return { ok: false, motivo: `Máximo de ${quiz.tentativasDia} tentativas por dia.` };
  }

  let acertos = 0;
  for (const p of quiz.perguntas) {
    const correta = p.alternativas.find((a) => a.correta);
    if (correta && respostas[p.id] === correta.id) acertos++;
  }
  const nota = quiz.perguntas.length ? Math.round((acertos / quiz.perguntas.length) * 100) : 0;
  const aprovado = nota >= quiz.notaMinima;

  await db.tentativaQuiz.create({ data: { usuarioId, quizId, nota, aprovado } });

  if (aprovado) {
    // A tentativa recém-criada já conta; ===1 = é a primeira aprovação.
    const aprovacoes = await db.tentativaQuiz.count({ where: { usuarioId, quizId, aprovado: true } });
    if (aprovacoes === 1) await concederXp(usuarioId, "quiz", quiz.aula.xp * 2, "Quiz", quiz.id);
    await concederConquistasPorCriterio(usuarioId, "quiz-100", nota);
    await concluirAula(usuarioId, quiz.aulaId);
  }

  return { ok: true, nota, aprovado };
}
