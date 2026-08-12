import "server-only";

import { db } from "../db";
import { empresaPadrao } from "./dados";

/**
 * Relatórios da Kyron Academy — leitura pura, sem efeito colateral.
 * Cobre o que o doc pede: conclusão média por trilha, aula com mais
 * abandono, alunos inativos 7/14/30 dias. Ranking fica de fora de propósito
 * (recomendação do doc: só ligar com 15+ alunos ativos).
 */

export async function conclusaoPorTrilha() {
  const empresa = await empresaPadrao();
  const trilhas = await db.trilha.findMany({
    where: { empresaId: empresa.id, status: { not: "ARQUIVADO" } },
    orderBy: { ordem: "asc" },
    include: { modulos: { include: { aulas: { where: { status: "PUBLICADO" } } } } },
  });
  const alunosAprovados = await db.usuario.count({ where: { aprovado: true } });

  return Promise.all(
    trilhas.map(async (t) => {
      const aulaIds = t.modulos.flatMap((m) => m.aulas.map((a) => a.id));
      if (aulaIds.length === 0 || alunosAprovados === 0) {
        return { id: t.id, nome: t.nome, nivel: t.nivel, status: t.status, conclusaoMedia: 0, aulas: aulaIds.length };
      }
      const concluidas = await db.progresso.count({ where: { aulaId: { in: aulaIds }, status: "CONCLUIDA" } });
      const possivel = aulaIds.length * alunosAprovados;
      return {
        id: t.id, nome: t.nome, nivel: t.nivel, status: t.status,
        conclusaoMedia: possivel ? Math.round((concluidas / possivel) * 100) : 0,
        aulas: aulaIds.length,
      };
    }),
  );
}

export async function aulasComMaisAbandono(limite = 5) {
  const aulas = await db.aula.findMany({
    where: { status: "PUBLICADO" },
    select: { id: true, titulo: true, modulo: { select: { nome: true, trilha: { select: { nome: true } } } } },
  });
  if (aulas.length === 0) return [];

  const linhas = await Promise.all(
    aulas.map(async (a) => {
      const [iniciadas, concluidas] = await Promise.all([
        db.progresso.count({ where: { aulaId: a.id } }),
        db.progresso.count({ where: { aulaId: a.id, status: "CONCLUIDA" } }),
      ]);
      const abandono = iniciadas > 0 ? Math.round((1 - concluidas / iniciadas) * 100) : 0;
      return {
        id: a.id, titulo: a.titulo, modulo: a.modulo.nome, trilha: a.modulo.trilha.nome,
        iniciadas, concluidas, abandono,
      };
    }),
  );

  return linhas.filter((l) => l.iniciadas > 0).sort((a, b) => b.abandono - a.abandono).slice(0, limite);
}

export async function alunosInativos() {
  const hoje = new Date();
  const cortes = { d7: new Date(hoje), d14: new Date(hoje), d30: new Date(hoje) };
  cortes.d7.setDate(cortes.d7.getDate() - 7);
  cortes.d14.setDate(cortes.d14.getDate() - 14);
  cortes.d30.setDate(cortes.d30.getDate() - 30);

  const [total, comPerfil, inativos7, inativos14, inativos30] = await Promise.all([
    db.usuario.count({ where: { aprovado: true } }),
    db.alunoPerfil.count({ where: { usuario: { aprovado: true } } }),
    db.alunoPerfil.count({ where: { usuario: { aprovado: true }, ultimoAcessoEm: { lt: cortes.d7 } } }),
    db.alunoPerfil.count({ where: { usuario: { aprovado: true }, ultimoAcessoEm: { lt: cortes.d14 } } }),
    db.alunoPerfil.count({ where: { usuario: { aprovado: true }, ultimoAcessoEm: { lt: cortes.d30 } } }),
  ]);

  return { total, nuncaComecou: total - comPerfil, inativos7, inativos14, inativos30 };
}
