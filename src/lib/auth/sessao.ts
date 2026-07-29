import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";

import { criarToken, lerToken, opcoesCookie } from "../core/security";
import { db } from "../db";

/**
 * Sessões da plataforma (módulo auth).
 *
 * Um cookie só — `kyron_session` — para TODAS as áreas (loja, ERP, aulas).
 * Diferença central para o modelo antigo: a sessão existe no BANCO (tabela
 * Sessao), então dá para REVOGAR na hora (logout de um dispositivo, ou
 * "encerrar todas as sessões"). Antes, um cookie assinado valia até expirar,
 * sem como cancelar.
 *
 * O cookie carrega um token aleatório assinado; no banco guardamos só o HASH
 * desse token. Vazamento do banco não vira sessão ativa (não dá para recriar o
 * cookie a partir do hash).
 */

export const COOKIE_SESSAO = "kyron_session";
const DURACAO_MS = 1000 * 60 * 60 * 24 * 30; // 30 dias; renovada a cada uso

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Extrai navegador/dispositivo do user-agent, de forma grosseira. */
function descreverAgente(ua: string | null): { navegador: string; dispositivo: string } {
  if (!ua) return { navegador: "Desconhecido", dispositivo: "Desconhecido" };
  const navegador = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\//.test(ua)
      ? "Opera"
      : /Chrome\//.test(ua)
        ? "Chrome"
        : /Firefox\//.test(ua)
          ? "Firefox"
          : /Safari\//.test(ua)
            ? "Safari"
            : "Outro";
  const dispositivo = /Mobi|Android|iPhone|iPad/.test(ua) ? "Celular" : "Computador";
  return { navegador, dispositivo };
}

/** Cria a sessão no banco e grava o cookie. Retorna o id da sessão. */
export async function abrirSessao(usuarioId: number): Promise<string> {
  const bruto = randomBytes(32).toString("hex");
  const h = await headers();
  const ua = h.get("user-agent");
  const { navegador, dispositivo } = descreverAgente(ua);
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null;

  const sessao = await db.sessao.create({
    data: {
      usuarioId,
      tokenHash: hashToken(bruto),
      navegador,
      dispositivo,
      ip,
      expiraEm: new Date(Date.now() + DURACAO_MS),
    },
  });

  // O cookie carrega o token bruto (o banco só tem o hash), assinado para
  // detecção de adulteração antes mesmo de tocar o banco.
  const token = criarToken(`${sessao.id}:${bruto}`, DURACAO_MS);
  (await cookies()).set(COOKIE_SESSAO, token, opcoesCookie(DURACAO_MS));
  return sessao.id;
}

type SessaoAtiva = { sessaoId: string; usuarioId: number };

/** Lê o cookie, valida assinatura e confere a sessão no banco. */
export async function sessaoAtual(): Promise<SessaoAtiva | null> {
  if (!process.env.ADMIN_SECRET) return null;
  const cookie = (await cookies()).get(COOKIE_SESSAO)?.value;
  const dados = lerToken(cookie); // valida assinatura + expiração do cookie
  if (!dados) return null;

  const sep = dados.indexOf(":");
  if (sep < 0) return null;
  const sessaoId = dados.slice(0, sep);
  const bruto = dados.slice(sep + 1);

  const sessao = await db.sessao.findUnique({
    where: { id: sessaoId },
    select: { id: true, usuarioId: true, tokenHash: true, expiraEm: true, revogadaEm: true },
  });
  if (!sessao || sessao.revogadaEm || sessao.expiraEm < new Date()) return null;
  if (sessao.tokenHash !== hashToken(bruto)) return null;

  return { sessaoId: sessao.id, usuarioId: sessao.usuarioId };
}

/** Revoga a sessão atual e apaga o cookie (logout deste dispositivo). */
export async function encerrarSessaoAtual(): Promise<void> {
  const atual = await sessaoAtual();
  if (atual) {
    await db.sessao
      .update({ where: { id: atual.sessaoId }, data: { revogadaEm: new Date() } })
      .catch(() => {});
  }
  (await cookies()).delete(COOKIE_SESSAO);
}

/** Revoga TODAS as sessões de um usuário (troca de senha, botão de pânico). */
export async function encerrarTodasSessoes(usuarioId: number): Promise<void> {
  await db.sessao.updateMany({
    where: { usuarioId, revogadaEm: null },
    data: { revogadaEm: new Date() },
  });
}

/** Dispositivos com sessão ativa — para a tela "onde estou conectado". */
export async function sessoesAtivas(usuarioId: number) {
  return db.sessao.findMany({
    where: { usuarioId, revogadaEm: null, expiraEm: { gt: new Date() } },
    orderBy: { criadoEm: "desc" },
    select: { id: true, navegador: true, dispositivo: true, ip: true, criadoEm: true },
  });
}
