"use server";

import { revalidatePath } from "next/cache";

import { auditar } from "../core/audit";
import { db } from "../db";
import { exigirPermissao } from "./auth";

/**
 * Aprovação e gestão de alunos (clientes das aulas) pelo ERP. Aprovar libera o
 * acesso às aulas restritas do Manual. Gate por permissão "alunos", auditado.
 */

export async function acaoAprovarAluno(id: number, aprovado: boolean): Promise<void> {
  const eu = await exigirPermissao("alunos");
  const alvo = await db.usuario.findUnique({ where: { id }, select: { nome: true, email: true } });
  await db.usuario.update({ where: { id }, data: { aprovado } });

  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp",
    acao: aprovado ? "aprovar-aluno" : "revogar-aluno",
    entidade: "Usuario",
    entidadeId: id,
    depois: { aprovado },
    metadata: { alvo: alvo?.nome, email: alvo?.email },
  });

  revalidatePath("/erp/alunos");
}

export async function acaoExcluirAluno(id: number): Promise<void> {
  const eu = await exigirPermissao("alunos");
  const alvo = await db.usuario.findUnique({ where: { id }, select: { nome: true, email: true } });
  await db.usuario.delete({ where: { id } });

  await auditar({
    ator: { tipo: "usuario", id: eu.id, nome: eu.nome },
    modulo: "erp",
    acao: "excluir-aluno",
    entidade: "Usuario",
    entidadeId: id,
    metadata: { alvo: alvo?.nome, email: alvo?.email },
  });

  revalidatePath("/erp/alunos");
}
