/**
 * Selos de confiança — sinais discretos, longe do visual de marketplace.
 * Hairline, ícone azul só como acento. Reforçam a segurança da compra sem
 * gritar promoção. Usados na página do produto e na vitrine de seminovos.
 */

type Selo = { titulo: string; texto: string; icone: "escudo" | "check" | "local" | "troca" };

const SELOS: Selo[] = [
  {
    icone: "escudo",
    titulo: "Garantia da loja",
    texto: "Todo seminovo sai com garantia própria, informada antes da compra.",
  },
  {
    icone: "check",
    titulo: "Revisado e testado",
    texto: "Bateria, tela e funções conferidas antes do aparelho ir à vitrine.",
  },
  {
    icone: "local",
    titulo: "Atendimento local",
    texto: "Santa Cruz do Sul e região, com conversa direta no WhatsApp.",
  },
  {
    icone: "troca",
    titulo: "Sem surpresa",
    texto: "Condição e preço à mostra. O que você vê é o que você leva.",
  },
];

export function SelosConfianca() {
  return (
    <ul className="grid gap-fluid-sm [grid-template-columns:repeat(auto-fit,minmax(min(100%,15rem),1fr))]">
      {SELOS.map((s) => (
        <li
          key={s.titulo}
          className="flex items-start gap-fluid-sm rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-md"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-kyron-sm border border-[var(--kyron-blue-line)] bg-[var(--kyron-blue-soft)] text-kyron-blue">
            <Icone tipo={s.icone} />
          </span>
          <div>
            <h3 className="text-fluid-sm font-semibold text-kyron-white">{s.titulo}</h3>
            <p className="mt-0.5 text-fluid-2xs leading-relaxed text-kyron-silver">
              {s.texto}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Icone({ tipo }: { tipo: Selo["icone"] }) {
  const comum = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (tipo === "escudo")
    return (
      <svg {...comum}>
        <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  if (tipo === "check")
    return (
      <svg {...comum}>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 3 3 5-6" />
      </svg>
    );
  if (tipo === "local")
    return (
      <svg {...comum}>
        <path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  return (
    <svg {...comum}>
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
