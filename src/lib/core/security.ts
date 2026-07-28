import "server-only";

import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

/**
 * Primitivas de segurança (core).
 *
 * Existiam três cópias quase idênticas destas funções (admin da loja, cliente
 * das aulas e colaborador do ERP). Centralizar evita que uma correção de
 * segurança seja aplicada em um lugar e esquecida nos outros.
 *
 * Nada aqui conhece regra de negócio — só hash, assinatura e comparação.
 */

const TAMANHO_HASH = 64;

/** Gera "salt:hash" (hex) com scrypt. */
export function gerarHash(senha: string): string {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(senha, salt, TAMANHO_HASH).toString("hex")}`;
}

/** Confere a senha contra "salt:hash", em tempo constante. */
export function conferirHash(senha: string, armazenado: string): boolean {
  const [salt, hashHex] = armazenado.split(":");
  if (!salt || !hashHex) return false;
  const esperado = Buffer.from(hashHex, "hex");
  const tentativa = scryptSync(senha, salt, TAMANHO_HASH);
  return (
    esperado.length === tentativa.length && timingSafeEqual(esperado, tentativa)
  );
}

/** Comparação de segredos em tempo constante (evita ataque de timing). */
export function iguaisEmTempoConstante(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

function segredo(): string {
  const s = process.env.ADMIN_SECRET;
  if (!s) throw new Error("ADMIN_SECRET ausente");
  return s;
}

export function assinar(payload: string): string {
  return createHmac("sha256", segredo()).update(payload).digest("hex");
}

/**
 * Monta um token de sessão "<dados>.<expiraEm>.<assinatura>".
 * O conteúdo é público (não é criptografia) — a assinatura é que garante que
 * ninguém alterou. Por isso nunca colocar segredo dentro do token.
 */
export function criarToken(dados: string, duracaoMs: number): string {
  const expira = Date.now() + duracaoMs;
  const payload = `${dados}.${expira}`;
  return `${payload}.${assinar(payload)}`;
}

/** Valida assinatura e expiração; devolve os dados ou null. */
export function lerToken(token: string | undefined): string | null {
  if (!token) return null;
  const partes = token.split(".");
  if (partes.length !== 3) return null;

  const [dados, expiraStr, assinatura] = partes;
  let esperada: string;
  try {
    esperada = assinar(`${dados}.${expiraStr}`);
  } catch {
    return null;
  }
  if (!iguaisEmTempoConstante(assinatura, esperada)) return null;

  const expira = Number(expiraStr);
  if (!Number.isFinite(expira) || expira < Date.now()) return null;
  return dados;
}

/** Opções padrão do cookie de sessão — mesma política em toda a plataforma. */
export function opcoesCookie(duracaoMs: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: Math.floor(duracaoMs / 1000),
  };
}
