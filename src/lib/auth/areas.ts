import "server-only";

import { redirect } from "next/navigation";

import { usuarioAtual, type UsuarioAtual } from "./service";

/**
 * Isolamento entre as duas áreas logadas da plataforma.
 *
 * Regra de negócio (definida pelo dono):
 * - Quem entra pela KYRON ACADEMY (aluno / papel CLIENTE) fica SÓ na Academy.
 * - Quem é da GESTÃO (papéis de equipe do ERP) fica SÓ no ERP.
 * - Apenas o MASTER (ADMIN_MASTER — a conta do Leandro Gofas) acessa os dois.
 *
 * A checagem é sempre no servidor, a cada requisição, derivada dos papéis do
 * banco — não dá para burlar pelo cliente. O acesso ao ERP já é isolado em
 * `colaboradorLogado()` (só papéis de equipe entram; CLIENTE nunca entra).
 * Aqui isolamos o lado da Academy.
 */

export function ehMaster(papeis: readonly string[]): boolean {
  return papeis.includes("ADMIN_MASTER");
}

/** Só aluno (CLIENTE) ou o Master enxergam a Academy. */
export function podeAcessarAcademy(papeis: readonly string[]): boolean {
  return ehMaster(papeis) || papeis.includes("CLIENTE");
}

/**
 * Garante que o usuário atual pode ver a Academy.
 * - Sem sessão → tela de login da Academy.
 * - Conta de gestão (sem ser Master) → recusa e volta ao login da Academy
 *   com aviso (NÃO leva para o ERP: a Academy não é porta de entrada do ERP).
 */
export async function guardaAcademy(): Promise<UsuarioAtual> {
  const u = await usuarioAtual();
  if (!u) redirect("/app/login");
  if (!podeAcessarAcademy(u.papeis)) redirect("/app/login?erro=somente-alunos");
  return u;
}
