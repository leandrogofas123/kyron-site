import "server-only";

import { db } from "../db";
import { CHAVES_EQUIPE } from "./auth";

/**
 * Alunos = usuários da plataforma SEM papel de equipe (clientes das aulas do
 * Manual de Instalação). Nascem pendentes; o ERP aprova. Fonte única: Usuario.
 */

export type AlunoLinha = {
  id: number;
  nome: string;
  email: string;
  telefone: string | null;
  aprovado: boolean;
  emailVerificado: boolean;
  ultimoLogin: string | null; // ISO
  criadoEm: string; // ISO
};

export async function listarAlunos(): Promise<AlunoLinha[]> {
  const usuarios = await db.usuario.findMany({
    where: { papeis: { none: { papel: { chave: { in: CHAVES_EQUIPE } } } } },
    orderBy: [{ aprovado: "asc" }, { criadoEm: "desc" }],
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      aprovado: true,
      emailVerificado: true,
      ultimoLogin: true,
      criadoEm: true,
    },
  });
  return usuarios.map((u) => ({
    id: u.id,
    nome: u.nome,
    email: u.email,
    telefone: u.telefone,
    aprovado: u.aprovado,
    emailVerificado: u.emailVerificado,
    ultimoLogin: u.ultimoLogin ? u.ultimoLogin.toISOString() : null,
    criadoEm: u.criadoEm.toISOString(),
  }));
}
