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
