import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Health check da plataforma. Usado por monitoramento externo/agendado.
 * 200 = site no ar E banco respondendo. 503 = algo quebrado (com o motivo).
 * Não expõe dado sensível — só o estado dos componentes.
 */
export async function GET() {
  const inicio = Date.now();
  let bancoOk = false;
  let erro: string | null = null;

  try {
    await db.$queryRaw`SELECT 1`;
    bancoOk = true;
  } catch (e) {
    erro = e instanceof Error ? e.message.slice(0, 200) : "falha no banco";
  }

  const corpo = {
    ok: bancoOk,
    site: true, // se este handler respondeu, o site está de pé
    banco: bancoOk,
    latenciaMs: Date.now() - inicio,
    quando: new Date().toISOString(),
    ...(erro ? { erro } : {}),
  };

  return Response.json(corpo, {
    status: bancoOk ? 200 : 503,
    headers: { "cache-control": "no-store" },
  });
}
