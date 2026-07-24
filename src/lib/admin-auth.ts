import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Autenticação do painel admin.
 *
 * Loja de um dono só — não precisa de tabela de usuários. Uma senha
 * (ADMIN_PASSWORD) e um segredo para assinar o cookie (ADMIN_SECRET).
 *
 * O cookie guarda um token assinado (HMAC), não a senha. httpOnly, então
 * JavaScript da página não lê. Sem ADMIN_PASSWORD configurada, o login sempre
 * falha — melhor admin desativado do que senha padrão.
 */

const COOKIE = "kyron_admin";
const DURACAO_MS = 1000 * 60 * 60 * 12; // 12 horas

function segredo(): string | null {
  return process.env.ADMIN_SECRET ?? null;
}

function assinar(payload: string): string {
  const s = segredo();
  if (!s) throw new Error("ADMIN_SECRET ausente");
  return createHmac("sha256", s).update(payload).digest("hex");
}

/** Confere a senha em tempo constante (evita ataque de timing). */
export function senhaConfere(tentativa: string): boolean {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) return false;
  const a = Buffer.from(tentativa);
  const b = Buffer.from(real);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function criarSessao(): Promise<void> {
  const expira = Date.now() + DURACAO_MS;
  const payload = `admin.${expira}`;
  const token = `${payload}.${assinar(payload)}`;

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACAO_MS / 1000,
  });
}

export async function encerrarSessao(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

/** true se há sessão válida e não expirada. */
export async function sessaoValida(): Promise<boolean> {
  if (!segredo() || !process.env.ADMIN_PASSWORD) return false;

  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;

  const partes = token.split(".");
  if (partes.length !== 3) return false;
  const [prefixo, expiraStr, assinatura] = partes;
  const payload = `${prefixo}.${expiraStr}`;

  let esperada: string;
  try {
    esperada = assinar(payload);
  } catch {
    return false;
  }

  const a = Buffer.from(assinatura);
  const b = Buffer.from(esperada);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  const expira = Number(expiraStr);
  return Number.isFinite(expira) && expira > Date.now();
}

/** Diz se o admin foi configurado (senha + segredo presentes). */
export function adminConfigurado(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SECRET);
}
