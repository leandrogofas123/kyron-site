import "server-only";

import { conferirHash, gerarHash } from "./core/security";
import { abrirSessao, encerrarSessaoAtual } from "./auth/sessao";
import { usuarioAtual } from "./auth/service";

/**
 * Compatibilidade da área de CLIENTES (aulas do Manual) com o módulo AUTH
 * unificado. Mesmo login de todo o resto; aqui só se traduz o formato antigo
 * ({id, nome, email, aprovado}) que as telas do Manual já esperam.
 *
 * O acesso às aulas continua dependendo de `aprovado` (o admin libera).
 */

export const hashSenha = gerarHash;
export const senhaConfere = conferirHash;

export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function criarSessaoUsuario(userId: number): Promise<void> {
  await abrirSessao(userId);
}

export async function encerrarSessaoUsuario(): Promise<void> {
  await encerrarSessaoAtual();
}

export type UsuarioSessao = {
  id: number;
  nome: string;
  email: string;
  aprovado: boolean;
};

/** Cliente logado (da sessão única), ou null. */
export async function usuarioLogado(): Promise<UsuarioSessao | null> {
  const u = await usuarioAtual();
  if (!u) return null;
  return { id: u.id, nome: u.nome, email: u.email, aprovado: u.aprovado };
}
