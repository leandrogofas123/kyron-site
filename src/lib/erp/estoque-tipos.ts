/**
 * Tipos de movimentação — compartilhado entre servidor e cliente.
 * Fica fora de estoque.ts porque aquele módulo é "server-only" e o formulário
 * de movimentação é um componente de cliente.
 *
 * `sinal`: +1 soma ao saldo, -1 subtrai, 0 = ajuste (define o saldo exato).
 */
export const TIPOS_MOVIMENTACAO = [
  { id: "entrada", label: "Entrada", sinal: 1 },
  { id: "devolucao", label: "Devolução", sinal: 1 },
  { id: "venda", label: "Venda", sinal: -1 },
  { id: "saida", label: "Saída", sinal: -1 },
  { id: "troca", label: "Troca", sinal: -1 },
  { id: "assistencia", label: "Assistência", sinal: -1 },
  { id: "transferencia", label: "Transferência", sinal: -1 },
  { id: "perda", label: "Perda", sinal: -1 },
  { id: "ajuste", label: "Ajuste de inventário", sinal: 0 },
] as const;

export type TipoMovimentacao = (typeof TIPOS_MOVIMENTACAO)[number]["id"];

export function rotuloTipo(id: string): string {
  return TIPOS_MOVIMENTACAO.find((t) => t.id === id)?.label ?? id;
}

export function sinalDe(tipo: string): number | null {
  return TIPOS_MOVIMENTACAO.find((t) => t.id === tipo)?.sinal ?? null;
}
