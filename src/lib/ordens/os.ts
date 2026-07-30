import "server-only";

import { db } from "../db";

export { STATUS_OS, STATUS_VALIDOS, rotuloStatusOS, type StatusOS } from "./status";

/**
 * Ordem de Serviço (módulo Orders). Consultas ao banco.
 * O ciclo de status puro vive em status.ts; a orquestração, em acoes.ts.
 */

/** OS abertas (tudo que não foi entregue nem cancelado) primeiro. */
export function listarOS(limite = 200) {
  return db.ordemServico.findMany({
    orderBy: [{ criadoEm: "desc" }],
    take: limite,
    select: {
      id: true,
      clienteNome: true,
      equipamento: true,
      status: true,
      valor: true,
      tecnicoNome: true,
      criadoEm: true,
    },
  });
}

export function obterOS(id: number) {
  return db.ordemServico.findUnique({
    where: { id },
    include: { cliente: { select: { id: true, nome: true, telefone: true } } },
  });
}

/** Técnicos/equipe para atribuir a OS (usuários com papel de equipe). */
export function tecnicosDisponiveis() {
  return db.usuario.findMany({
    where: {
      ativo: true,
      papeis: { some: { papel: { chave: { in: ["TECNICO", "GERENTE", "ADMIN", "ADMIN_MASTER"] } } } },
    },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true },
  });
}

/** Clientes para vincular à OS. */
export function clientesParaOS() {
  return db.clienteErp.findMany({
    where: { excluidoEm: null },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true },
  });
}
