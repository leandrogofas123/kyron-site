import "server-only";

import { cache } from "react";

import { db } from "../db";

/**
 * Leitura do conteúdo da Kyron Academy (V2) — lado do ERP (admin).
 *
 * Multiempresa desde já: toda leitura passa pela empresa "kyron" (única hoje).
 * Quando existir mais de uma empresa, isto vira parâmetro em vez de constante.
 */

export const empresaPadrao = cache(async () => {
  return db.empresa.upsert({
    where: { slug: "kyron" },
    update: {},
    create: { slug: "kyron", nome: "Kyron Tecnologia" },
  });
});

export async function getTrilhasAdmin() {
  const empresa = await empresaPadrao();
  const trilhas = await db.trilha.findMany({
    where: { empresaId: empresa.id },
    orderBy: { ordem: "asc" },
    include: {
      _count: { select: { modulos: true } },
      modulos: { select: { _count: { select: { aulas: true } } } },
    },
  });
  return trilhas.map((t) => ({
    ...t,
    totalAulas: t.modulos.reduce((s, m) => s + m._count.aulas, 0),
  }));
}

export async function getTrilhaAdmin(id: number) {
  return db.trilha.findUnique({
    where: { id },
    include: {
      modulos: {
        orderBy: { ordem: "asc" },
        include: { aulas: { orderBy: { ordem: "asc" } } },
      },
    },
  });
}

export async function getMateriaisAdmin() {
  return db.material.findMany({
    where: { status: { not: "ARQUIVADO" } },
    orderBy: { criadoEm: "desc" },
    include: {
      trilha: { select: { nome: true } },
      aula: { select: { titulo: true } },
    },
  });
}

/** Trilhas para o seletor de vínculo do upload (nome + id, todas as não-arquivadas). */
export async function getTrilhasParaVinculo() {
  const empresa = await empresaPadrao();
  return db.trilha.findMany({
    where: { empresaId: empresa.id, status: { not: "ARQUIVADO" } },
    orderBy: { ordem: "asc" },
    select: { id: true, nome: true },
  });
}

export async function getAulaAdminCompleta(id: number) {
  return db.aula.findUnique({
    where: { id },
    include: {
      modulo: { include: { trilha: { select: { id: true, nome: true } } } },
      preRequisitos: { include: { dependeDe: { select: { id: true, titulo: true } } } },
      quiz: { include: { perguntas: { include: { alternativas: true }, orderBy: { ordem: "asc" } } } },
    },
  });
}

/** Outras aulas da mesma trilha (candidatas a pré-requisito) — exclui a própria aula. */
export async function getOutrasAulasDaTrilha(trilhaId: number, excluirAulaId: number) {
  const modulos = await db.modulo.findMany({
    where: { trilhaId },
    orderBy: { ordem: "asc" },
    include: { aulas: { orderBy: { ordem: "asc" }, select: { id: true, titulo: true } } },
  });
  return modulos.flatMap((m) => m.aulas).filter((a) => a.id !== excluirAulaId);
}

export async function getConquistasAdmin() {
  return db.conquista.findMany({
    orderBy: { id: "asc" },
    include: { _count: { select: { alunos: true } } },
  });
}

/** Tudo que a tela de detalhe do aluno precisa: perfil, trilhas com %, conquistas, certificados. */
export async function getAlunoDetalheAdmin(usuarioId: number) {
  const empresa = await empresaPadrao();
  const [usuario, perfil, trilhasPublicadas, conquistasGanhas, certificados, todasConquistas] = await Promise.all([
    db.usuario.findUnique({ where: { id: usuarioId }, select: { id: true, nome: true, email: true, aprovado: true } }),
    db.alunoPerfil.findUnique({ where: { usuarioId } }),
    db.trilha.findMany({
      where: { empresaId: empresa.id, status: "PUBLICADO" },
      orderBy: { ordem: "asc" },
      include: { modulos: { where: { status: "PUBLICADO" }, include: { aulas: { where: { status: "PUBLICADO" } } } } },
    }),
    db.conquistaAluno.findMany({ where: { usuarioId }, include: { conquista: true } }),
    db.certificado.findMany({ where: { usuarioId }, include: { trilha: { select: { nome: true } } } }),
    db.conquista.findMany({ orderBy: { nome: "asc" } }),
  ]);
  if (!usuario) return null;

  const todasAulaIds = trilhasPublicadas.flatMap((t) => t.modulos.flatMap((m) => m.aulas.map((a) => a.id)));
  const concluidas = todasAulaIds.length
    ? await db.progresso.findMany({ where: { usuarioId, aulaId: { in: todasAulaIds }, status: "CONCLUIDA" }, select: { aulaId: true } })
    : [];
  const concluidasSet = new Set(concluidas.map((c) => c.aulaId));

  const trilhas = trilhasPublicadas.map((t) => {
    const aulaIds = t.modulos.flatMap((m) => m.aulas.map((a) => a.id));
    const total = aulaIds.length;
    const feitas = aulaIds.filter((id) => concluidasSet.has(id)).length;
    const jaTemCertificado = certificados.some((c) => c.trilhaId === t.id);
    return {
      id: t.id, nome: t.nome, nivel: t.nivel,
      percentual: total ? Math.round((feitas / total) * 100) : 0,
      jaTemCertificado,
    };
  });

  return { usuario, perfil, trilhas, conquistasGanhas, certificados, todasConquistas };
}

export async function contadoresAcademy() {
  const [trilhas, publicadas, aulas, aulasPublicadas, alunosAprovados] = await Promise.all([
    db.trilha.count(),
    db.trilha.count({ where: { status: "PUBLICADO" } }),
    db.aula.count(),
    db.aula.count({ where: { status: "PUBLICADO" } }),
    db.usuario.count({ where: { aprovado: true } }),
  ]);
  return { trilhas, publicadas, aulas, aulasPublicadas, alunosAprovados };
}
