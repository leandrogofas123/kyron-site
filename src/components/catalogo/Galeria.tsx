"use client";

import Image from "next/image";
import { useState } from "react";

import { ProdutoImagem } from "./ProdutoImagem";

type Img = { url: string; principal: boolean };

/** Galeria do produto: imagem grande + miniaturas clicáveis. */
export function Galeria({ imagens, nome }: { imagens: Img[]; nome: string }) {
  const ordenadas = [...imagens].sort(
    (a, b) => Number(b.principal) - Number(a.principal),
  );
  const [ativa, setAtiva] = useState(0);

  if (ordenadas.length === 0) {
    return <ProdutoImagem alt={nome} prioridade />;
  }

  return (
    <div className="flex flex-col gap-fluid-sm">
      <ProdutoImagem src={ordenadas[ativa]?.url} alt={nome} prioridade />

      {ordenadas.length > 1 && (
        <ul className="flex flex-wrap gap-fluid-xs">
          {ordenadas.map((img, i) => (
            <li key={img.url}>
              <button
                type="button"
                onClick={() => setAtiva(i)}
                aria-label={`Ver imagem ${i + 1}`}
                aria-current={i === ativa ? "true" : undefined}
                className={`relative h-16 w-16 overflow-hidden rounded-kyron-sm border transition-colors duration-300 ${
                  i === ativa
                    ? "border-[var(--kyron-blue-line)]"
                    : "border-[var(--kyron-hairline)] hover:border-[var(--kyron-hairline-strong)]"
                }`}
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
