/**
 * Logger da plataforma (core).
 *
 * Substitui `console.*` espalhado. Em produção emite JSON de uma linha (fácil
 * de filtrar nos logs do Railway); em desenvolvimento, texto legível.
 *
 * Regra: NUNCA registrar segredo. `sanitizar()` remove chaves sensíveis
 * (senha, token, apiKey, authorization…) antes de gravar.
 */

type Nivel = "debug" | "info" | "warn" | "error";

const PRODUCAO = process.env.NODE_ENV === "production";

/** Só loga debug quando explicitamente pedido. */
const NIVEL_MINIMO: Nivel = process.env.LOG_LEVEL === "debug" ? "debug" : "info";
const ORDEM: Record<Nivel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

const CHAVES_SENSIVEIS =
  /senha|password|secret|token|apikey|api_key|authorization|cookie|hash/i;

function sanitizar(valor: unknown, profundidade = 0): unknown {
  if (valor == null || profundidade > 4) return valor;
  if (valor instanceof Error) {
    return { erro: valor.name, mensagem: valor.message, stack: valor.stack };
  }
  if (Array.isArray(valor)) return valor.map((v) => sanitizar(v, profundidade + 1));
  if (typeof valor === "object") {
    const saida: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(valor as Record<string, unknown>)) {
      saida[k] = CHAVES_SENSIVEIS.test(k) ? "[oculto]" : sanitizar(v, profundidade + 1);
    }
    return saida;
  }
  return valor;
}

function emitir(nivel: Nivel, mensagem: string, contexto?: Record<string, unknown>) {
  if (ORDEM[nivel] < ORDEM[NIVEL_MINIMO]) return;

  const dados = contexto ? (sanitizar(contexto) as Record<string, unknown>) : undefined;

  if (PRODUCAO) {
    const linha = JSON.stringify({
      nivel,
      mensagem,
      em: new Date().toISOString(),
      ...(dados ?? {}),
    });
    if (nivel === "error") console.error(linha);
    else if (nivel === "warn") console.warn(linha);
    else console.log(linha);
    return;
  }

  const prefixo = `[kyron:${nivel}]`;
  if (nivel === "error") console.error(prefixo, mensagem, dados ?? "");
  else if (nivel === "warn") console.warn(prefixo, mensagem, dados ?? "");
  else console.log(prefixo, mensagem, dados ?? "");
}

export const logger = {
  debug: (m: string, c?: Record<string, unknown>) => emitir("debug", m, c),
  info: (m: string, c?: Record<string, unknown>) => emitir("info", m, c),
  warn: (m: string, c?: Record<string, unknown>) => emitir("warn", m, c),
  error: (m: string, c?: Record<string, unknown>) => emitir("error", m, c),
};
