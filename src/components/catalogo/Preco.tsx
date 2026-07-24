import { formatarPreco, precoVigente } from "@/lib/format";

/**
 * Exibição de preço. Regra da spec: produto sem preço não existe — este
 * componente sempre mostra um valor. Quando há promoção, o preço antigo
 * aparece riscado ao lado.
 */
export function Preco({
  preco,
  precoPromo,
  tamanho = "md",
}: {
  preco: number;
  precoPromo?: number | null;
  tamanho?: "sm" | "md" | "lg";
}) {
  const { atual, original, emPromocao } = precoVigente(preco, precoPromo ?? null);

  const escala =
    tamanho === "lg"
      ? "text-fluid-2xl"
      : tamanho === "sm"
        ? "text-fluid-base"
        : "text-fluid-lg";

  return (
    <div className="flex flex-wrap items-baseline gap-x-fluid-xs gap-y-1">
      <span className={`kyron-display ${escala} text-kyron-white`}>
        {formatarPreco(atual)}
      </span>
      {emPromocao && original != null && (
        <span className="text-fluid-xs text-kyron-silver/50 line-through">
          {formatarPreco(original)}
        </span>
      )}
    </div>
  );
}
