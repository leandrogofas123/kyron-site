import "server-only";

import { unstable_cache } from "next/cache";

/**
 * Cache da camada de dados do catálogo.
 *
 * PROBLEMA QUE RESOLVE
 * A auditoria do site em produção encontrou `cache-control: private, no-cache,
 * no-store` em todas as páginas: cada visita renderizava do zero e consultava o
 * Postgres. A causa é `export const dynamic = "force-dynamic"` nas páginas de
 * `(site)` — posto ali para o build não tentar ler o banco, o que desligou o
 * cache do site inteiro como efeito colateral.
 *
 * POR QUE CACHEAR O DADO, E NÃO A PÁGINA
 * Trocar `force-dynamic` por `revalidate` faria o Next tentar pré-renderizar as
 * páginas durante o build — exatamente o que se queria evitar. Cacheando a
 * consulta, a página continua dinâmica (o build nunca toca no banco) e ainda
 * assim o Postgres deixa de ser consultado a cada acesso.
 *
 * INVALIDAÇÃO
 * `src/lib/admin-actions.ts` já chama `revalidatePath` em toda alteração, mas
 * essas chamadas não surtiam efeito com as páginas dinâmicas. Agora as ações do
 * admin também chamam `revalidateTag` com as tags abaixo, e a mudança aparece
 * no site na hora — sem esperar o TTL.
 */

/** Tags de invalidação, por domínio de dado. */
export const TAG = {
  /** Qualquer coisa do catálogo. Invalida tudo de uma vez. */
  catalogo: "catalogo",
  produtos: "catalogo:produtos",
  seminovos: "catalogo:seminovos",
  servicos: "catalogo:servicos",
  categorias: "catalogo:categorias",
} as const;

/**
 * TTL padrão, em segundos. É o teto: uma alteração no admin invalida por tag
 * antes disso. Cinco minutos mantém a vitrine fresca sem martelar o banco.
 */
export const TTL_CATALOGO = 300;

/**
 * Memoriza uma consulta ao banco entre requisições.
 *
 * @param chave  Partes que identificam a consulta. Precisa incluir TODO
 *               argumento que altere o resultado — senão duas consultas
 *               diferentes compartilham a mesma entrada de cache.
 * @param tags   Tags de invalidação que atingem esta entrada.
 */
export function cachear<TArgs extends unknown[], TRetorno>(
  consulta: (...args: TArgs) => Promise<TRetorno>,
  chave: string[],
  tags: string[],
  ttlSegundos: number = TTL_CATALOGO,
): (...args: TArgs) => Promise<TRetorno> {
  return unstable_cache(consulta, chave, {
    revalidate: ttlSegundos,
    tags: [TAG.catalogo, ...tags],
  });
}
