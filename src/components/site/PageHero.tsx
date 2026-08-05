import type { ReactNode } from "react";

/** Abertura padrão das páginas internas — mais curta que o hero da home. */
export function PageHero({
  eyebrow,
  titulo,
  lede,
  children,
}: {
  eyebrow: string;
  titulo: ReactNode;
  lede?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden pb-fluid-md pt-fluid-lg">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -top-[18vw] aspect-square w-[min(34rem,80vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(30,107,255,0.1),transparent_68%)]"
      />

      <div className="container-kyron relative flex flex-col items-center text-center">
        <p className="kyron-label text-fluid-2xs tracking-[0.18em] text-kyron-silver/70">
          {eyebrow}
        </p>

        <h1 className="kyron-display mt-fluid-xs max-w-[30ch] text-fluid-2xl leading-[1.05] text-kyron-white">
          {titulo}
        </h1>

        {lede && (
          <p className="mt-fluid-sm max-w-[68ch] text-fluid-base text-kyron-silver">
            {lede}
          </p>
        )}

        {children}
      </div>
    </section>
  );
}
