import "server-only";

import { headers } from "next/headers";

import { db } from "../db";
import { logger } from "./logger";

/**
 * Trilha de auditoria (core).
 *
 * Responde "quem fez o quê, quando e de onde". Complementa o ledger de estoque:
 * cobre o que ele não vê — preço alterado, acesso concedido, cliente aprovado,
 * login, exclusão lógica.
 *
 * NUNCA quebra o fluxo: auditar é efeito colateral. Se falhar, registra no
 * logger e a ação do usuário segue normalmente.
 */

export type Ator = {
  tipo: "admin" | "colaborador" | "usuario" | "sistema";
  id?: number | null;
  nome?: string | null;
};

export type EventoAuditoria = {
  ator: Ator;
  modulo: "erp" | "admin" | "loja" | "auth";
  acao: string; // criar | atualizar | excluir | aprovar | revogar | login | ...
  entidade?: string;
  entidadeId?: string | number | null;
  antes?: unknown;
  depois?: unknown;
  metadata?: Record<string, unknown>;
};

/** Guarda no máximo os campos que mudaram, em JSON curto. */
function serializar(valor: unknown): string | null {
  if (valor === undefined || valor === null) return null;
  try {
    const texto = JSON.stringify(valor);
    return texto.length > 4000 ? `${texto.slice(0, 4000)}…` : texto;
  } catch {
    return null;
  }
}

/**
 * Diferença entre dois objetos: só as chaves que realmente mudaram.
 * Evita gravar o registro inteiro a cada edição.
 */
export function diferenca<T extends Record<string, unknown>>(
  antes: T | null | undefined,
  depois: T | null | undefined,
): { antes: Partial<T>; depois: Partial<T> } {
  const a: Partial<T> = {};
  const d: Partial<T> = {};
  if (!antes || !depois) return { antes: antes ?? {}, depois: depois ?? {} };

  for (const chave of new Set([...Object.keys(antes), ...Object.keys(depois)])) {
    const va = antes[chave as keyof T];
    const vd = depois[chave as keyof T];
    if (JSON.stringify(va) !== JSON.stringify(vd)) {
      a[chave as keyof T] = va;
      d[chave as keyof T] = vd;
    }
  }
  return { antes: a, depois: d };
}

async function origem(): Promise<{ ip: string | null; userAgent: string | null }> {
  try {
    const h = await headers();
    const ip =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      h.get("x-real-ip") ??
      null;
    return { ip, userAgent: h.get("user-agent") };
  } catch {
    return { ip: null, userAgent: null }; // fora de requisição (job, seed)
  }
}

export async function auditar(evento: EventoAuditoria): Promise<void> {
  try {
    const { ip, userAgent } = await origem();
    await db.auditLog.create({
      data: {
        atorTipo: evento.ator.tipo,
        atorId: evento.ator.id ?? null,
        atorNome: evento.ator.nome ?? null,
        modulo: evento.modulo,
        acao: evento.acao,
        entidade: evento.entidade ?? null,
        entidadeId:
          evento.entidadeId != null ? String(evento.entidadeId) : null,
        valorAntes: serializar(evento.antes),
        valorDepois: serializar(evento.depois),
        ip,
        userAgent: userAgent?.slice(0, 300) ?? null,
        metadata: serializar(evento.metadata),
      },
    });
  } catch (erro) {
    // Auditoria nunca derruba a operação do usuário.
    logger.error("falha ao gravar auditoria", { erro, acao: evento.acao });
  }
}

/** Consulta para a tela de auditoria. */
export function listarAuditoria(filtro?: {
  modulo?: string;
  acao?: string;
  entidade?: string;
  limite?: number;
}) {
  return db.auditLog.findMany({
    where: {
      ...(filtro?.modulo ? { modulo: filtro.modulo } : {}),
      ...(filtro?.acao ? { acao: filtro.acao } : {}),
      ...(filtro?.entidade ? { entidade: filtro.entidade } : {}),
    },
    orderBy: { criadoEm: "desc" },
    take: filtro?.limite ?? 200,
  });
}
