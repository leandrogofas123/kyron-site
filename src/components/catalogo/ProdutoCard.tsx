import Link from "next/link";

import { Preco } from "./Preco";
import { ProdutoImagem } from "./ProdutoImagem";

/** Estrutura mínima que o card precisa — compatível com o retorno do catálogo. */
export type ProdutoCardData = {
  slug: string;
  nome: string;
  marca: string | null;
  preco: number;
  precoPromo: number | null;
  imagens: { url: string; principal: boolean }[];
  seminovo: { saudeBateria: number | null; condicaoEstetica: string } | null;
};

export function ProdutoCard({
  produto,
  prioridade = false,
}: {
  produto: ProdutoCardData;
  prioridade?: boolean;
}) {
  const capa = produto.imagens.find((i) => i.principal) ?? produto.imagens[0];
  const emPromocao =
    produto.precoPromo != null && produto.precoPromo < produto.preco;

  return (
    <Link
      href={`/produtos/${produto.slug}`}
      className="group flex h-full flex-col rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-sm transition-all duration-[400ms] ease-in-out hover:-translate-y-0.5 hover:border-[var(--kyron-blue-line)]"
    >
      <div className="relative">
        <ProdutoImagem src={capa?.url} alt={produto.nome} prioridade={prioridade} />

        {/* Selos: no máximo os que informam. Azul só marca informação real. */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {produto.seminovo && (
            <span className="kyron-label rounded-full bg-kyron-black/80 px-fluid-xs py-1 text-fluid-2xs text-kyron-silver backdrop-blur">
              Seminovo
            </span>
          )}
          {emPromocao && (
            <span className="kyron-label rounded-full bg-kyron-blue px-fluid-xs py-1 text-fluid-2xs text-white">
              Oferta
            </span>
          )}
        </div>
      </div>

      <div className="mt-fluid-sm flex flex-1 flex-col">
        {produto.marca && (
          <span className="kyron-label text-fluid-2xs text-kyron-silver/50">
            {produto.marca}
          </span>
        )}
        <h3 className="mt-1 text-fluid-sm font-semibold text-kyron-white">
          {produto.nome}
        </h3>

        {produto.seminovo?.saudeBateria != null && (
          <p className="mt-1 text-fluid-2xs text-kyron-silver/70">
            Bateria {produto.seminovo.saudeBateria}% · {produto.seminovo.condicaoEstetica}
          </p>
        )}

        <div className="mt-auto pt-fluid-sm">
          <Preco preco={produto.preco} precoPromo={produto.precoPromo} tamanho="sm" />
        </div>
      </div>
    </Link>
  );
}
