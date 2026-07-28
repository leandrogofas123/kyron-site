import "server-only";

/**
 * Cache da plataforma (core).
 *
 * Implementação em MEMÓRIA por enquanto — é o suficiente para o volume atual e
 * não adiciona infraestrutura. A interface é o que importa: trocar por Redis
 * depois não muda uma linha nos módulos que consomem.
 *
 * Atenção honesta: em memória, o cache é por instância. Se um dia houver mais
 * de uma réplica no Railway, cada uma terá o seu — daí vale o Redis.
 */

type Entrada = { valor: unknown; expiraEm: number };

const memoria = new Map<string, Entrada>();
const LIMITE_ENTRADAS = 500;

function agora() {
  return Date.now();
}

function limpar() {
  const t = agora();
  for (const [k, e] of memoria) if (e.expiraEm <= t) memoria.delete(k);
  // Trava de memória: se ainda estourar, descarta as mais antigas.
  if (memoria.size > LIMITE_ENTRADAS) {
    const excedente = memoria.size - LIMITE_ENTRADAS;
    let i = 0;
    for (const k of memoria.keys()) {
      if (i++ >= excedente) break;
      memoria.delete(k);
    }
  }
}

export const cache = {
  get<T>(chave: string): T | null {
    const e = memoria.get(chave);
    if (!e) return null;
    if (e.expiraEm <= agora()) {
      memoria.delete(chave);
      return null;
    }
    return e.valor as T;
  },

  set(chave: string, valor: unknown, segundos = 60): void {
    limpar();
    memoria.set(chave, { valor, expiraEm: agora() + segundos * 1000 });
  },

  invalidate(prefixo: string): void {
    for (const k of memoria.keys()) if (k.startsWith(prefixo)) memoria.delete(k);
  },

  clear(): void {
    memoria.clear();
  },

  /** Busca no cache; se não houver, executa a função e guarda o resultado. */
  async lembrar<T>(
    chave: string,
    segundos: number,
    calcular: () => Promise<T>,
  ): Promise<T> {
    const existente = cache.get<T>(chave);
    if (existente !== null) return existente;
    const valor = await calcular();
    cache.set(chave, valor, segundos);
    return valor;
  },
};
