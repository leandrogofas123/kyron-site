import "server-only";

import { cache } from "react";

import { db } from "../db";
import {
  conjuntoPermite,
  NOME_PAPEL,
  papelPrincipal,
  permissoesDe,
  type Papel,
  type Permissao,
} from "./permissoes";
import { sessaoAtual } from "./sessao";

/**
 * AuthService — a única porta de autenticação/autorização da plataforma.
 *
 * Todo módulo (loja, ERP, aulas, CRM) pergunta AQUI quem está logado e o que
 * pode fazer. Ninguém mais lê cookie, confere senha ou consulta papel por conta
 * própria. Assim, mudar a política de acesso é mudar um lugar só.
 *
 * As permissões são sempre derivadas do banco (papéis do usuário) a cada
 * requisição — revogar acesso é instantâneo.
 */

export type UsuarioAtual = {
  id: number;
  nome: string;
  email: string;
  avatar: string | null;
  aprovado: boolean;
  papeis: string[];
  papelPrincipal: Papel | null;
  papelNome: string;
  permissoes: Set<string>;
};

/**
 * Usuário da requisição atual, ou null. Memoizado por requisição com
 * `cache()`: várias telas/ações podem chamar sem multiplicar consultas.
 */
export const usuarioAtual = cache(async (): Promise<UsuarioAtual | null> => {
  const s = await sessaoAtual();
  if (!s) return null;

  const u = await db.usuario.findFirst({
    where: { id: s.usuarioId, ativo: true },
    select: {
      id: true,
      nome: true,
      email: true,
      avatar: true,
      aprovado: true,
      papeis: { select: { papel: { select: { chave: true } } } },
    },
  });
  if (!u) return null;

  const papeis = u.papeis.map((p) => p.papel.chave);
  return {
    id: u.id,
    nome: u.nome,
    email: u.email,
    avatar: u.avatar,
    aprovado: u.aprovado,
    papeis,
    papelPrincipal: papelPrincipal(papeis),
    papelNome: papelPrincipal(papeis) ? NOME_PAPEL[papelPrincipal(papeis) as Papel] : "Usuário",
    permissoes: permissoesDe(papeis),
  };
});

export async function temPermissao(acao: Permissao | string): Promise<boolean> {
  const u = await usuarioAtual();
  if (!u) return false;
  return conjuntoPermite(u.permissoes, acao);
}

export async function temPapel(papel: Papel): Promise<boolean> {
  const u = await usuarioAtual();
  return Boolean(u?.papeis.includes(papel));
}

/** Garante login em Server Actions/páginas. Lança se não houver. */
export async function exigirLogin(): Promise<UsuarioAtual> {
  const u = await usuarioAtual();
  if (!u) throw new Error("Não autorizado.");
  return u;
}

/** Garante login + permissão. Lança se faltar qualquer um. */
export async function exigirPermissao(acao: Permissao | string): Promise<UsuarioAtual> {
  const u = await exigirLogin();
  if (!conjuntoPermite(u.permissoes, acao)) {
    throw new Error("Sem permissão para esta ação.");
  }
  return u;
}
