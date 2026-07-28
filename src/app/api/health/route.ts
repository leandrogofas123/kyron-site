import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { criarLog } from "@/lib/log";

/**
 * Verificação de saúde da aplicação.
 *
 * PARA QUE SERVE
 * O Railway reinicia o contêiner quando o healthcheck falha. Sem esta rota, o
 * site pode ficar "no ar" respondendo 200 na home enquanto o Postgres está
 * inacessível — toda página de catálogo quebrando e nada avisando. Com ela, a
 * falha vira reinício automático e fica registrada.
 *
 * Também é o endereço que um monitor externo (UptimeRobot, BetterStack) deve
 * consultar, em vez da home: a home tem cache e responderia 200 mesmo com o
 * banco caído.
 *
 * CONFIGURAR NO RAILWAY
 * Settings → Deploy → Health Check Path: /api/health
 *
 * O QUE NÃO EXPÕE
 * Nada de versão de biblioteca, string de conexão ou variável de ambiente —
 * a rota é pública e essas informações ajudariam um atacante a mirar versões
 * vulneráveis. Só o essencial: está de pé, o banco responde, e em quanto tempo.
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;

const log = criarLog("health");

/** Tempo além do qual o banco é considerado indisponível. */
const LIMITE_BANCO_MS = 3000;

async function checarBanco(): Promise<{ ok: boolean; ms: number; erro?: string }> {
  const inicio = Date.now();
  try {
    await Promise.race([
      db.$queryRaw`SELECT 1`,
      new Promise((_, rejeitar) =>
        setTimeout(
          () => rejeitar(new Error(`sem resposta em ${LIMITE_BANCO_MS}ms`)),
          LIMITE_BANCO_MS,
        ),
      ),
    ]);
    return { ok: true, ms: Date.now() - inicio };
  } catch (erro) {
    return {
      ok: false,
      ms: Date.now() - inicio,
      erro: erro instanceof Error ? erro.message : "falha desconhecida",
    };
  }
}

export async function GET() {
  const banco = await checarBanco();
  const saudavel = banco.ok;

  if (!saudavel) {
    // Só registra quando há problema: healthcheck roda de minuto em minuto e
    // logar sucesso encheria o painel de ruído, escondendo o que importa.
    log.erro("banco indisponível", { ms: banco.ms, detalhe: banco.erro });
  }

  return NextResponse.json(
    {
      status: saudavel ? "ok" : "degradado",
      momento: new Date().toISOString(),
      verificacoes: {
        banco: { ok: banco.ok, ms: banco.ms },
      },
    },
    {
      // 503 é o que faz o Railway agir. 200 com corpo dizendo "degradado"
      // passaria despercebido.
      status: saudavel ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
