import "server-only";

import { cache } from "../core/cache";
import { db } from "../db";

/**
 * Configuração da loja (módulo Platform, tenant único).
 *
 * Chaves conhecidas com valor padrão — assim o site nunca nasce vazio se ainda
 * não foi configurado. Leitura em cache curto (o aviso aparece em toda página);
 * salvar invalida o cache.
 */

export const CHAVES = {
  avisoAtivo: "aviso_ativo", // "1" | "0"
  avisoTexto: "aviso_texto",
  horario: "horario",
} as const;

export const PADROES: Record<string, string> = {
  [CHAVES.avisoAtivo]: "0",
  [CHAVES.avisoTexto]: "",
  [CHAVES.horario]: "Atendimento com hora marcada — fale no WhatsApp para agendar.",
};

const CACHE_CHAVE = "config:todas";
const TTL = 30; // segundos

/** Todas as configurações (mescladas com os padrões), em cache. */
export async function obterConfigs(): Promise<Record<string, string>> {
  return cache.lembrar(CACHE_CHAVE, TTL, async () => {
    const mapa: Record<string, string> = { ...PADROES };
    try {
      // Best-effort: durante o build (pré-render de páginas estáticas) o banco
      // pode não estar acessível — nesse caso ficamos com os padrões. Em runtime
      // lê normalmente.
      const linhas = await db.configuracao.findMany();
      for (const l of linhas) mapa[l.chave] = l.valor;
    } catch {
      /* mantém os padrões */
    }
    return mapa;
  });
}

export async function obterConfig(chave: string): Promise<string> {
  const todas = await obterConfigs();
  return todas[chave] ?? PADROES[chave] ?? "";
}

/** Aviso do site pronto para exibição (ou null se desligado/vazio). */
export async function avisoLoja(): Promise<string | null> {
  const c = await obterConfigs();
  const ativo = c[CHAVES.avisoAtivo] === "1";
  const texto = c[CHAVES.avisoTexto]?.trim();
  return ativo && texto ? texto : null;
}

export function invalidarConfig(): void {
  cache.invalidate("config:");
}
