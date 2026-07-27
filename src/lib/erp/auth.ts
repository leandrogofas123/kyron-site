import "server-only";

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

import { db } from "../db";

/**
 * Autenticação e permissões (RBAC) do ERP.
 *
 * Colaboradores têm papel: admin | gerente | vendedor | tecnico.
 * A sessão é um cookie httpOnly assinado (HMAC); o papel é sempre lido do
 * banco a cada acesso, então revogar/alterar permissão é instantâneo.
 */

const COOKIE = "kyron_erp";
const DURACAO_MS = 1000 * 60 * 60 * 12; // 12 horas

export const PAPEIS = ["admin", "gerente", "vendedor", "tecnico"] as const;
export type Papel = (typeof PAPEIS)[number];

/** O que cada papel pode fazer. Regra única, usada em telas e ações. */
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

function segredo(): string {
  const s = process.env.ADMIN_SECRET;
  if (!s) throw new Error("ADMIN_SECRET ausente");
  return s;
}

function assinar(payload: string): string {
  return createHmac("sha256", segredo()).update(payload).digest("hex");
}

export function hashSenha(senha: string): string {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(senha, salt, 64).toString("hex")}`;
}

export function senhaConfere(senha: string, armazenado: string): boolean {
  const [salt, hashHex] = armazenado.split(":");
  if (!salt || !hashHex) return false;
  const esperado = Buffer.from(hashHex, "hex");
  const tentativa = scryptSync(senha, salt, 64);
  return esperado.length === tentativa.length && timingSafeEqual(esperado, tentativa);
}

export async function criarSessaoErp(colaboradorId: number): Promise<void> {
  const expira = Date.now() + DURACAO_MS;
  const payload = `${colaboradorId}.${expira}`;
  (await cookies()).set(COOKIE, `${payload}.${assinar(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACAO_MS / 1000,
  });
}

export async function encerrarSessaoErp(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

export type ColaboradorSessao = {
  id: number;
  nome: string;
  email: string;
  papel: string;
};

/** Colaborador logado (lido do banco) ou null. */
export async function colaboradorLogado(): Promise<ColaboradorSessao | null> {
  if (!process.env.ADMIN_SECRET) return null;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;

  const partes = token.split(".");
  if (partes.length !== 3) return null;
  const [idStr, expiraStr, assinatura] = partes;

  let esperada: string;
  try {
    esperada = assinar(`${idStr}.${expiraStr}`);
  } catch {
    return null;
  }
  const a = Buffer.from(assinatura);
  const b = Buffer.from(esperada);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  const expira = Number(expiraStr);
  if (!Number.isFinite(expira) || expira < Date.now()) return null;

  const id = Number(idStr);
  if (!Number.isInteger(id)) return null;

  const c = await db.colaborador.findFirst({
    where: { id, ativo: true },
    select: { id: true, nome: true, email: true, papel: true },
  });
  return c ?? null;
}

/** Garante sessão + permissão em Server Actions. Lança se não puder. */
export async function exigirPermissao(acao: string): Promise<ColaboradorSessao> {
  const c = await colaboradorLogado();
  if (!c) throw new Error("Não autorizado.");
  if (!podeFazer(c.papel, acao)) throw new Error("Sem permissão para esta ação.");
  return c;
}
