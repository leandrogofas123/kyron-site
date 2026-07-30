import "server-only";

import { db } from "../db";

/**
 * Registro de integrações externas (módulo Integrations).
 *
 * Lista APENAS os serviços que a plataforma realmente usa. Cada um declara a
 * variável de ambiente que o configura; o status vem de checar essa env +
 * consolidar o log de chamadas. Nada de adapters para serviços inexistentes —
 * quando entrar um marketplace/gateway real, ele ganha sua entrada aqui.
 */

export type ProviderInfo = {
  id: string;
  nome: string;
  categoria: string;
  envVar: string;
  obrigatorio: boolean;
};

export const PROVIDERS: ProviderInfo[] = [
  { id: "anthropic", nome: "Anthropic (assistente)", categoria: "IA", envVar: "ANTHROPIC_API_KEY", obrigatorio: true },
  { id: "resend", nome: "Resend (e-mail)", categoria: "Comunicação", envVar: "RESEND_API_KEY", obrigatorio: false },
  { id: "hubspot", nome: "HubSpot (CRM externo)", categoria: "CRM", envVar: "HUBSPOT_TOKEN", obrigatorio: false },
];

export type StatusIntegracao = ProviderInfo & {
  configurado: boolean;
  ativo: boolean; // configurado E não é o hubspot (suspenso)
  ultimaChamada: Date | null;
  ultimoStatus: string | null;
  chamadas7d: number;
  falhas7d: number;
  latenciaMedia: number | null;
};

/** Status de cada provider: configurado? último resultado? volume recente? */
export async function statusIntegracoes(): Promise<StatusIntegracao[]> {
  const desde = new Date(Date.now() - 7 * 864e5);

  const [porProvider, ultimas, medias] = await Promise.all([
    db.integracaoLog.groupBy({
      by: ["provider"],
      where: { criadoEm: { gte: desde } },
      _count: { _all: true },
    }),
    db.integracaoLog.findMany({
      where: { criadoEm: { gte: desde } },
      orderBy: { criadoEm: "desc" },
      distinct: ["provider"],
      select: { provider: true, status: true, criadoEm: true },
    }),
    db.integracaoLog.groupBy({
      by: ["provider"],
      where: { criadoEm: { gte: desde }, latenciaMs: { not: null } },
      _avg: { latenciaMs: true },
    }),
  ]);

  const falhas = await db.integracaoLog.groupBy({
    by: ["provider"],
    where: { criadoEm: { gte: desde }, status: "erro" },
    _count: { _all: true },
  });

  const mapaChamadas = new Map(porProvider.map((p) => [p.provider, p._count._all]));
  const mapaFalhas = new Map(falhas.map((p) => [p.provider, p._count._all]));
  const mapaUltima = new Map(ultimas.map((u) => [u.provider, u]));
  const mapaMedia = new Map(medias.map((m) => [m.provider, m._avg.latenciaMs]));

  return PROVIDERS.map((p) => {
    const configurado = Boolean(process.env[p.envVar]);
    const ultima = mapaUltima.get(p.id);
    return {
      ...p,
      configurado,
      ativo: configurado && p.id !== "hubspot",
      ultimaChamada: ultima?.criadoEm ?? null,
      ultimoStatus: ultima?.status ?? null,
      chamadas7d: mapaChamadas.get(p.id) ?? 0,
      falhas7d: mapaFalhas.get(p.id) ?? 0,
      latenciaMedia: mapaMedia.get(p.id) != null ? Math.round(mapaMedia.get(p.id) as number) : null,
    };
  });
}

/** Últimas chamadas registradas, para a lista de atividade. */
export function ultimasChamadas(limite = 50) {
  return db.integracaoLog.findMany({
    orderBy: { criadoEm: "desc" },
    take: limite,
  });
}
