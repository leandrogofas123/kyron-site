/**
 * Plano de contas e formas de pagamento (módulo Financeiro).
 *
 * Fica NO CÓDIGO — versionado, consistente para relatório por categoria. Enxuto
 * de propósito: o que uma loja física de tecnologia realmente usa. Cresce quando
 * fizer falta, não por antecipação.
 */

export const CATEGORIAS_RECEITA = [
  "Venda de produtos",
  "Serviços / instalação",
  "Assistência técnica",
  "Outras receitas",
] as const;

export const CATEGORIAS_DESPESA = [
  "Compra de mercadoria",
  "Aluguel",
  "Energia / água",
  "Internet / telefone",
  "Marketing",
  "Impostos",
  "Salários / pró-labore",
  "Taxas de cartão",
  "Outras despesas",
] as const;

export const FORMAS_PAGAMENTO = [
  { id: "pix", rotulo: "PIX" },
  { id: "cartao", rotulo: "Cartão" },
  { id: "dinheiro", rotulo: "Dinheiro" },
  { id: "boleto", rotulo: "Boleto" },
  { id: "transferencia", rotulo: "Transferência" },
] as const;

export function rotuloForma(id: string | null | undefined): string {
  if (!id) return "—";
  return FORMAS_PAGAMENTO.find((f) => f.id === id)?.rotulo ?? id;
}

/** Categorias válidas conforme o tipo do lançamento. */
export function categoriasDe(tipo: "entrada" | "saida"): readonly string[] {
  return tipo === "entrada" ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA;
}
