/**
 * Metadados de ordenação da vitrine — separados de catalogo.ts (que é
 * "server-only") para poderem ser usados também no componente de controles,
 * que roda no cliente. Só tipos e constantes, sem acesso ao banco.
 */

export type OrdenarProdutos =
  | "relevancia"
  | "menor-preco"
  | "maior-preco"
  | "novidades";

export const ORDENACOES: { valor: OrdenarProdutos; rotulo: string }[] = [
  { valor: "relevancia", rotulo: "Relevância" },
  { valor: "menor-preco", rotulo: "Menor preço" },
  { valor: "maior-preco", rotulo: "Maior preço" },
  { valor: "novidades", rotulo: "Novidades" },
];
