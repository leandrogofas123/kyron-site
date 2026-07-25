import "server-only";

import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";

import { db } from "./db";

/**
 * Autenticação de CLIENTES (área de aulas do Manual de Instalação).
 *
 * Diferente do admin: aqui há uma tabela (Usuario), a senha é guardada com
 * HASH (scrypt + salt, nunca a senha crua), e o cadastro é livre — mas o acesso
 * às aulas só é liberado depois que o admin marca `aprovado`.
 *
 * A sessão é um cookie httpOnly assinado (HMAC) com o mesmo segredo do admin.
 * O cookie só prova QUEM é o usuário; se ele está aprovado é checado no banco a
 * cada acesso, então revogar acesso é instantâneo (basta desaprovar).
 */

const COOKIE = "kyron_user";
const DURACAO_MS = 1000 * 60 * 60 * 24 * 30; // 30 dias

function segredo(): string {
  const s = process.env.ADMIN_SECRET;
  if (!s) throw new Error("ADMIN_SECRET ausente");
  return s;
}

function assinar(payload: string): string {
  return createHmac("sha256", segredo()).update(payload).digest("hex");
}

/** Gera "salt:hash" (hex). O salt é aleatório por usuário. */
export function hashSenha(senha: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(senha, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

/** Confere a senha em tempo constante contra o "salt:hash" guardado. */
export function senhaConfere(senha: string, armazenado: string): boolean {
  const [salt, hashHex] = armazenado.split(":");
  if (!salt || !hashHex) return false;
  const esperado = Buffer.from(hashHex, "hex");
  const tentativa = scryptSync(senha, salt, 64);
  return (
    esperado.length === tentativa.length &&
    timingSafeEqual(esperado, tentativa)
  );
}

export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function criarSessaoUsuario(userId: number): Promise<void> {
  const expira = Date.now() + DURACAO_MS;
  const payload = `${userId}.${expira}`;
  const token = `${payload}.${assinar(payload)}`;

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACAO_MS / 1000,
  });
}

export async function encerrarSessaoUsuario(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

/** Valida o cookie e devolve o id do usuário, ou null. */
function idDaSessao(token: string | undefined): number | null {
  if (!token) return null;
  const partes = token.split(".");
  if (partes.length !== 3) return null;
  const [idStr, expiraStr, assinatura] = partes;
  const payload = `${idStr}.${expiraStr}`;

  let esperada: string;
  try {
    esperada = assinar(payload);
  } catch {
    return null;
  }

  const a = Buffer.from(assinatura);
  const b = Buffer.from(esperada);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  const expira = Number(expiraStr);
  if (!Number.isFinite(expira) || expira < Date.now()) return null;

  const id = Number(idStr);
  return Number.isInteger(id) ? id : null;
}

export type UsuarioSessao = {
  id: number;
  nome: string;
  email: string;
  aprovado: boolean;
};

/** Usuário logado (lido do banco), ou null. Também revalida se ainda existe. */
export async function usuarioLogado(): Promise<UsuarioSessao | null> {
  if (!process.env.ADMIN_SECRET) return null;
  const token = (await cookies()).get(COOKIE)?.value;
  const id = idDaSessao(token);
  if (id == null) return null;

  const u = await db.usuario.findUnique({
    where: { id },
    select: { id: true, nome: true, email: true, aprovado: true },
  });
  return u ?? null;
}
