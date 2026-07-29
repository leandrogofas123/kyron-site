import "server-only";

import { encerrarSessaoAtual } from "./auth/sessao";
import { temPermissao, usuarioAtual } from "./auth/service";

/**
 * Compatibilidade do painel admin com o módulo AUTH unificado.
 *
 * Antes: uma senha no .env e um cookie próprio (kyron_admin). Agora o acesso ao
 * painel é apenas uma PERMISSÃO ("admin.painel") de um usuário da plataforma —
 * o mesmo login do ERP e das aulas. As telas do admin não mudaram: continuam
 * chamando `sessaoValida()`.
 */

/** Há usuário logado com permissão de painel administrativo. */
export async function sessaoValida(): Promise<boolean> {
  return temPermissao("admin.painel");
}

export async function encerrarSessao(): Promise<void> {
  await encerrarSessaoAtual();
}

/** E-mail para pré-preencher o formulário de login (nunca a senha). */
export function emailAdmin(): string | null {
  return process.env.ADMIN_EMAIL ?? null;
}

/** O cookie ainda é assinado com ADMIN_SECRET; sem ele, não há login. */
export function adminConfigurado(): boolean {
  return Boolean(process.env.ADMIN_SECRET);
}

/** Nome de quem está logado, para o cabeçalho do painel. */
export async function nomeAdmin(): Promise<string | null> {
  const u = await usuarioAtual();
  return u?.nome ?? null;
}
