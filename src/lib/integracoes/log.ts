import "server-only";

import { db } from "../db";
import { logger } from "../core/logger";

/**
 * Registro de chamadas externas (módulo Integrations).
 *
 * Ponto único de observabilidade: todo consumo de API externa passa a deixar um
 * registro (provider, operação, status, latência). Best-effort — nunca quebra a
 * chamada de negócio.
 */

type Entrada = {
  provider: string;
  operacao: string;
  status: "ok" | "erro";
  latenciaMs?: number;
  erro?: string;
};

export async function logIntegracao(e: Entrada): Promise<void> {
  try {
    await db.integracaoLog.create({
      data: {
        provider: e.provider,
        operacao: e.operacao,
        status: e.status,
        latenciaMs: e.latenciaMs ?? null,
        erro: e.erro ? e.erro.slice(0, 300) : null,
      },
    });
  } catch (erro) {
    logger.error("falha ao registrar log de integração", { erro, provider: e.provider });
  }
}

/**
 * Envolve uma chamada externa: cronometra, registra ok/erro e repassa o
 * resultado (ou relança o erro, já registrado).
 */
export async function medir<T>(
  provider: string,
  operacao: string,
  fn: () => Promise<T>,
): Promise<T> {
  const inicio = Date.now();
  try {
    const r = await fn();
    await logIntegracao({ provider, operacao, status: "ok", latenciaMs: Date.now() - inicio });
    return r;
  } catch (erro) {
    await logIntegracao({
      provider,
      operacao,
      status: "erro",
      latenciaMs: Date.now() - inicio,
      erro: erro instanceof Error ? erro.message : String(erro),
    });
    throw erro;
  }
}
