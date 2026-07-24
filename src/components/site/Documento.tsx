import type { ReactNode } from "react";

/** Casca de documento legal — medida de leitura e ritmo tipográfico fixos. */
export function Documento({
  children,
  atualizadoEm,
}: {
  children: ReactNode;
  atualizadoEm: string;
}) {
  return (
    <article className="container-kyron pb-section pt-fluid-lg">
      <div className="max-w-[68ch]">
        <p className="kyron-label mb-fluid-lg text-fluid-2xs text-kyron-silver/55">
          Atualizado em {atualizadoEm}
        </p>
        <div className="documento space-y-fluid-sm text-fluid-base text-kyron-silver">
          {children}
        </div>
      </div>
    </article>
  );
}

export function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="kyron-display pt-fluid-md text-fluid-lg text-kyron-white">
      {children}
    </h2>
  );
}

export function Lista({ itens }: { itens: ReactNode[] }) {
  return (
    <ul className="space-y-fluid-2xs">
      {itens.map((item, i) => (
        <li
          key={i}
          className="relative pl-fluid-sm before:absolute before:left-0 before:top-[0.75em] before:h-px before:w-2.5 before:bg-kyron-blue"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
