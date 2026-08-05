/**
 * Faixa de diferenciais da Home — dá "vida" e informação logo na entrada, com
 * os motivos concretos para comprar na Kyron. Conteúdo fiel ao que a loja faz:
 * seminovos avaliados, instalação em domicílio, atendimento humano e loja
 * física. Ícones inline (sem dependência), no padrão da marca.
 */

type Item = { titulo: string; texto: string; icone: React.ReactNode };

const svg = (d: React.ReactNode) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

const ITENS: Item[] = [
  {
    titulo: "Seminovos com garantia",
    texto: "Bateria e estética avaliadas item a item antes de ir para a vitrine.",
    icone: svg(<><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" /><path d="M9.5 12l1.8 1.8L15 10" /></>),
  },
  {
    titulo: "Instalação em domicílio",
    texto: "A gente vende, configura e instala sua automação e áudio na sua casa.",
    icone: svg(<><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></>),
  },
  {
    titulo: "Atendimento consultivo",
    texto: "Conversa direta e humana no WhatsApp para escolher o certo, sem enrolação.",
    icone: svg(<><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></>),
  },
  {
    titulo: "Loja física em Santa Cruz",
    texto: "Você vê, testa e leva na hora — suporte de verdade, perto de você.",
    icone: svg(<><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></>),
  },
];

export function FaixaDiferenciais() {
  return (
    <section className="py-fluid-md">
      <div className="container-kyron">
        <ul className="grid gap-fluid-xs sm:grid-cols-2 xl:grid-cols-4">
          {ITENS.map((it) => (
            <li
              key={it.titulo}
              className="flex gap-fluid-sm rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-md transition-colors hover:border-[var(--kyron-blue-line)]"
            >
              <span className="mt-0.5 shrink-0 text-kyron-blue">{it.icone}</span>
              <div className="min-w-0">
                <h3 className="kyron-label text-fluid-2xs text-kyron-white">{it.titulo}</h3>
                <p className="mt-1 text-fluid-2xs leading-relaxed text-kyron-silver/70">{it.texto}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
