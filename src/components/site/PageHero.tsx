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
    <section className="relative overflow-hidden pb-fluid-xl pt-fluid-xl">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[15vw] -top-[25vw] aspect-square w-[min(38rem,85vw)] rounded-full bg-[radial-gradient(circle,rgba(30,107,255,0.1),transparent_68%)]"
      />

      <div className="container-kyron relative">
        <p className="kyron-label text-fluid-2xs tracking-[0.18em] text-kyron-silver/70">
          {eyebrow}
        </p>

        <h1 className="kyron-display mt-fluid-sm max-w-[18ch] text-fluid-hero text-kyron-white">
          {titulo}
        </h1>

        {lede && (
          <p className="mt-fluid-md max-w-[52ch] text-fluid-lg text-kyron-silver">
            {lede}
          </p>
        )}

        {children}
      </div>
    </section>
  );
}
