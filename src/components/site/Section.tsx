import type { ReactNode } from "react";

/** Casca de seção — ritmo vertical fluido, idêntico em todo o site. */
export function Section({
  id,
  children,
  className = "",
  semBorda = false,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  semBorda?: boolean;
}) {
  return (
    <section
      id={id}
      className={`py-section ${
        semBorda ? "" : "border-t border-[var(--kyron-hairline)]"
      } ${className}`}
    >
      <div className="container-kyron">{children}</div>
    </section>
  );
}

/** Cabeçalho de seção — nenhum título do site vive fora dele. */
export function SectionHeader({
  eyebrow,
  titulo,
  lede,
}: {
  eyebrow: string;
  titulo: ReactNode;
  lede?: string;
}) {
  return (
    <div className="mb-fluid-xl max-w-[60ch]">
      <p className="kyron-label text-fluid-2xs tracking-[0.18em] text-kyron-silver/70">
        {eyebrow}
      </p>
      <h2 className="kyron-display mt-fluid-xs max-w-[20ch] text-fluid-3xl text-kyron-white">
        {titulo}
      </h2>
      {lede && (
        <p className="mt-fluid-sm text-fluid-lg text-kyron-silver">{lede}</p>
      )}
    </div>
  );
}
