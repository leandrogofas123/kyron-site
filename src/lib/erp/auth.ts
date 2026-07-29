import "server-only";

import { conferirHash, gerarHash } from "../core/security";
import { abrirSessao, encerrarSessaoAtual } from "../auth/sessao";
import { usuarioAtual } from "../auth/service";

/**
 * Compatibilidade do ERP com o módulo AUTH unificado.
 *
 * Antes este arquivo tinha seu próprio cookie (kyron_erp), hash e RBAC. Agora
 * ele apenas TRADUZ a sessão única (kyron_session / Usuario / papéis) para o
 * formato que as telas e ações do ERP já esperam — assim nenhuma delas precisou
 * mudar. A política de acesso do ERP (o que cada papel faz) continua definida
 * aqui, em termos das ações internas do ERP.
 */

// Papéis do ERP no formato antigo. Mantido para os formulários/validações que
// já existem; o mapa novo→antigo abaixo faz a ponte.
export const PAPEIS = ["admin", "gerente", "vendedor", "tecnico"] as const;
export type Papel = (typeof PAPEIS)[number];

const PERMISSOES: Record<Papel, string[]> = {
  admin: ["*"],
  gerente: [
    "dashboard",
    "produtos.ver",
    "produtos.editar",
    "estoque.ver",
    "estoque.movimentar",
    "notas.ver",
    "notas.importar",
    "fornecedores.ver",
    "fornecedores.editar",
    "clientes.ver",
    "clientes.editar",
  ],
  vendedor: [
    "dashboard",
    "produtos.ver",
    "estoque.ver",
    "estoque.movimentar",
    "clientes.ver",
    "clientes.editar",
  ],
  tecnico: ["dashboard", "produtos.ver", "estoque.ver", "estoque.movimentar"],
};

export function podeFazer(papel: string, acao: string): boolean {
  const lista = PERMISSOES[papel as Papel];
  if (!lista) return false;
  return lista.includes("*") || lista.includes(acao);
}

/** Papel unificado (ADMIN_MASTER…) → papel do ERP (admin…). */
export function papelErpDaLista(papeis: string[]): Papel | null {
  if (papeis.includes("ADMIN_MASTER") || papeis.includes("ADMIN")) return "admin";
  if (papeis.includes("GERENTE")) return "gerente";
  if (papeis.includes("VENDEDOR")) return "vendedor";
  if (papeis.includes("TECNICO")) return "tecnico";
  return null; // sem papel de equipe → sem acesso ao ERP
}

/** Papel do ERP (admin…) → chave unificada (ADMIN…) ao gravar. */
export const CHAVE_UNIFICADA: Record<Papel, string> = {
  admin: "ADMIN",
  gerente: "GERENTE",
  vendedor: "VENDEDOR",
  tecnico: "TECNICO",
};

/** Papéis de equipe (dão acesso ao ERP) — o resto é cliente das aulas. */
export const CHAVES_EQUIPE = [
  "ADMIN_MASTER",
  "ADMIN",
  "GERENTE",
  "VENDEDOR",
  "TECNICO",
  "FINANCEIRO",
  "SUPORTE",
];

// Hash: delega ao core. Mantido exportado porque ações antigas ainda importam.
export const hashSenha = gerarHash;
export const senhaConfere = conferirHash;

/** Abre a sessão única para um usuário (id de Usuario). */
export async function criarSessaoErp(usuarioId: number): Promise<void> {
  await abrirSessao(usuarioId);
}

export async function encerrarSessaoErp(): Promise<void> {
  await encerrarSessaoAtual();
}

export type ColaboradorSessao = {
  id: number;
  nome: string;
  email: string;
  papel: string;
};

/**
 * "Colaborador logado" no formato antigo, derivado da sessão única.
 * Só retorna se o usuário tiver papel de equipe (não-cliente).
 */
export async function colaboradorLogado(): Promise<ColaboradorSessao | null> {
  const u = await usuarioAtual();
  if (!u) return null;
  const papel = papelErpDaLista(u.papeis);
  if (!papel) return null;
  return { id: u.id, nome: u.nome, email: u.email, papel };
}

/** Garante sessão + permissão em Server Actions do ERP. */
export async function exigirPermissao(acao: string): Promise<ColaboradorSessao> {
  const c = await colaboradorLogado();
  if (!c) throw new Error("Não autorizado.");
  if (!podeFazer(c.papel, acao)) throw new Error("Sem permissão para esta ação.");
  return c;
}
