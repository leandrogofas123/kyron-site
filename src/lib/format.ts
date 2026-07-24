/**
 * Formatação de dinheiro.
 *
 * Regra do projeto: dinheiro é guardado em CENTAVOS (Int) no banco. Aqui vira
 * texto em reais para exibição. Nunca fazemos conta com o valor formatado.
 */

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** 199990 → "R$ 1.999,90" */
export function formatarPreco(centavos: number): string {
  return brl.format(centavos / 100);
}

/** "1999,90" ou "1999.90" ou "R$ 1.999,90" → 199990 (centavos). */
export function parsePreco(entrada: string): number | null {
  const limpo = entrada
    .replace(/[R$\s.]/g, "") // remove R$, espaços e separador de milhar
    .replace(",", ".");
  const valor = Number.parseFloat(limpo);
  if (!Number.isFinite(valor) || valor < 0) return null;
  return Math.round(valor * 100);
}

/**
 * Preço vigente e se está em promoção.
 * precoPromo, quando existe, é o preço que vale.
 */
export function precoVigente(preco: number, precoPromo: number | null): {
  atual: number;
  original: number | null;
  emPromocao: boolean;
} {
  if (precoPromo != null && precoPromo < preco) {
    return { atual: precoPromo, original: preco, emPromocao: true };
  }
  return { atual: preco, original: null, emPromocao: false };
}

/** Gera slug a partir do nome: "iPhone 13 Pro (128GB)" → "iphone-13-pro-128gb" */
export function gerarSlug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // tira acento (marcas diacríticas)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // não-alfanumérico vira hífen
    .replace(/^-+|-+$/g, ""); // tira hífen das pontas
}
