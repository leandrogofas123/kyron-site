import Image from "next/image";
import Link from "next/link";

import { Section } from "@/components/site/Section";
import { linkWhatsApp } from "@/lib/kyron/site";

/**
 * Seção editorial de Casa Inteligente na Home. Explica, com fotos reais, o que a
 * Kyron resolve em automação residencial — e leva ao catálogo ou ao WhatsApp.
 * Conteúdo fiel ao que a loja vende e instala.
 */

const SOLUCOES = [
  "Iluminação inteligente — lâmpadas e fitas de LED",
  "Tomadas e interruptores Wi-Fi",
  "Comando por voz com Alexa",
  "Câmeras e fechaduras inteligentes",
  "Controle de TV e ar-condicionado por Wi-Fi",
  "Rotinas e automações personalizadas",
];

const APOIO = [
  { src: "/automacao/controle-clima.jpg", legenda: "TV e ar-condicionado no controle" },
  { src: "/automacao/casa-alexa.jpg", legenda: "Comando por voz com Alexa" },
  { src: "/automacao/instalacao.jpg", legenda: "Instalação feita pela nossa equipe" },
];

function Check() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-kyron-blue">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function SecaoCasaInteligente() {
  const wpp = linkWhatsApp("Olá! Quero montar minha casa inteligente com a Kyron.");

  return (
    <Section id="casa-inteligente">
      <div className="grid items-center gap-fluid-lg lg:grid-cols-2">
        {/* Foto principal */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-black">
          <Image
            src="/automacao/automacao-residencial.jpg"
            alt="Ambiente de casa inteligente com iluminação e controle pelo celular"
            fill
            sizes="(min-width: 1024px) 46vw, 92vw"
            className="object-cover"
          />
        </div>

        {/* Conteúdo */}
        <div>
          <p className="kyron-label text-fluid-2xs tracking-[0.18em] text-kyron-silver/70">
            Casa Inteligente
          </p>
          <h2 className="kyron-display mt-fluid-xs max-w-[18ch] text-fluid-2xl text-kyron-white">
            Sua casa controlada pelo <span className="text-kyron-blue">celular</span> ou por voz.
          </h2>
          <p className="mt-fluid-sm max-w-[52ch] text-fluid-base text-kyron-silver">
            Luzes, tomadas, câmeras, fechaduras, TV e ar-condicionado num só app —
            ou num comando de voz. A Kyron indica os produtos certos, configura e
            instala tudo. Você só aproveita.
          </p>

          <ul className="mt-fluid-md grid gap-fluid-2xs sm:grid-cols-2">
            {SOLUCOES.map((s) => (
              <li key={s} className="flex gap-2 text-fluid-sm text-kyron-silver">
                <Check />
                <span>{s}</span>
              </li>
            ))}
          </ul>

          <div className="mt-fluid-lg flex flex-wrap gap-fluid-xs">
            <Link
              href="/produtos?categoria=casa-inteligente"
              className="kyron-label rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-sm text-fluid-xs text-white transition-all duration-300 hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(30,107,255,0.28)]"
            >
              Ver produtos
            </Link>
            {wpp && (
              <a
                href={wpp}
                target="_blank"
                rel="noopener noreferrer"
                className="kyron-label rounded-kyron-sm border border-[var(--kyron-hairline-strong)] px-fluid-md py-fluid-sm text-fluid-xs text-kyron-silver transition-colors duration-300 hover:border-[var(--kyron-blue-line)] hover:text-kyron-white"
              >
                Montar no WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Fotos de apoio */}
      <ul className="mt-fluid-lg grid gap-fluid-sm sm:grid-cols-3">
        {APOIO.map((a) => (
          <li key={a.src} className="group relative aspect-[4/3] overflow-hidden rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-black">
            <Image
              src={a.src}
              alt={a.legenda}
              fill
              sizes="(min-width: 640px) 30vw, 92vw"
              className="object-cover transition-transform duration-[600ms] group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-fluid-sm">
              <span className="kyron-label text-fluid-2xs text-kyron-white">{a.legenda}</span>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
