import { Section, SectionHeader } from "./Section";

/**
 * Acordeão sobre <details>/<summary>.
 *
 * Acessível e indexável por padrão: funciona sem JavaScript, é navegável por
 * teclado nativamente e o conteúdo está no HTML para o buscador ler.
 */
export function FAQ({
  perguntas,
  titulo = "Perguntas frequentes",
}: {
  perguntas: { p: string; r: string }[];
  titulo?: string;
}) {
  return (
    <Section>
      <SectionHeader eyebrow="Dúvidas" titulo={titulo} />

      <ul className="max-w-[68ch] divide-y divide-[var(--kyron-hairline)] border-y border-[var(--kyron-hairline)]">
        {perguntas.map((item) => (
          <li key={item.p}>
            <details className="group">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-fluid-sm py-fluid-sm text-fluid-base font-semibold text-kyron-white [&::-webkit-details-marker]:hidden">
                {item.p}
                <span
                  aria-hidden="true"
                  className="mt-1 shrink-0 text-kyron-blue transition-transform duration-300 ease-in-out group-open:rotate-45"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 5v14M5 12h14"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </summary>
              <p className="pb-fluid-sm pr-fluid-lg text-fluid-sm text-kyron-silver">
                {item.r}
              </p>
            </details>
          </li>
        ))}
      </ul>
    </Section>
  );
}
