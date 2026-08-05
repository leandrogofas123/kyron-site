import Image from "next/image";
import Link from "next/link";

import { linkWhatsApp } from "@/lib/kyron/site";

/**
 * Hero da Home — duas colunas: mensagem + CTAs à esquerda, visual do produto à
 * direita. Preenche a largura (o layout centralizado antigo deixava as laterais
 * vazias) e traz mais conteúdo: garantias, linhas atendidas e conversa direta.
 */

const GARANTIAS = ["Nota fiscal", "Garantia", "Suporte local"];
const LINHAS = [
  { nome: "Apple", href: "/produtos?categoria=apple" },
  { nome: "Seminovos", href: "/seminovos" },
  { nome: "Casa Inteligente", href: "/produtos?categoria=casa-inteligente" },
  { nome: "Áudio", href: "/produtos?categoria=audio" },
];

function Pin() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-kyron-blue">
      <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function HeroHome() {
  const wpp = linkWhatsApp("Olá! Vim pelo site da Kyron e quero uma ajuda para escolher.");

  return (
    <section className="relative overflow-hidden py-fluid-lg">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[10vw] -top-[8vw] aspect-square w-[min(38rem,80vw)] rounded-full bg-[radial-gradient(circle,rgba(30,107,255,0.14),transparent_66%)]"
      />
      <div className="container-kyron relative grid items-center gap-fluid-lg lg:grid-cols-[1.05fr_0.95fr]">
        {/* Texto */}
        <div>
          <p className="kyron-label inline-flex items-center gap-1.5 rounded-full border border-[var(--kyron-hairline-strong)] px-fluid-sm py-1 text-fluid-2xs tracking-[0.16em] text-kyron-silver/80">
            <Pin /> Santa Cruz do Sul · RS
          </p>
          <h1 className="kyron-display mt-fluid-sm max-w-[16ch] text-fluid-hero leading-[1.02] text-kyron-white">
            Tecnologia premium, <span className="text-kyron-blue">perto</span> de você.
          </h1>
          <p className="mt-fluid-md max-w-[46ch] text-fluid-base text-kyron-silver">
            Apple novos e seminovos, casa inteligente, áudio e instalação em
            domicílio. Atendimento consultivo e conversa direta no WhatsApp — sem
            robô, sem enrolação.
          </p>

          <div className="mt-fluid-lg flex flex-wrap gap-fluid-xs">
            <Link
              href="/produtos"
              className="kyron-label rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-sm text-fluid-xs text-white transition-all duration-300 hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(30,107,255,0.28)]"
            >
              Ver produtos
            </Link>
            <Link
              href="/seminovos"
              className="kyron-label rounded-kyron-sm border border-[var(--kyron-hairline-strong)] px-fluid-md py-fluid-sm text-fluid-xs text-kyron-silver transition-colors duration-300 hover:border-[var(--kyron-blue-line)] hover:text-kyron-white"
            >
              iPhone seminovos
            </Link>
            {wpp && (
              <a
                href={wpp}
                target="_blank"
                rel="noopener noreferrer"
                className="kyron-label rounded-kyron-sm px-fluid-md py-fluid-sm text-fluid-xs text-kyron-blue transition-colors hover:text-kyron-white"
              >
                Falar no WhatsApp →
              </a>
            )}
          </div>

          {/* Garantias em linha */}
          <ul className="mt-fluid-lg flex flex-wrap gap-x-fluid-md gap-y-fluid-xs">
            {GARANTIAS.map((g) => (
              <li key={g} className="inline-flex items-center gap-1.5 text-fluid-2xs text-kyron-silver/80">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="text-kyron-blue">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                {g}
              </li>
            ))}
          </ul>
        </div>

        {/* Visual */}
        <div className="relative">
          <div className="relative mx-auto aspect-square w-full max-w-[28rem] overflow-hidden rounded-kyron-lg border border-[var(--kyron-hairline)] bg-[radial-gradient(circle_at_50%_38%,rgba(30,107,255,0.18),transparent_60%)]">
            <Image
              src="/exemplos/iphone-novo.webp"
              alt="iPhone novo — toda a linha Apple na Kyron"
              fill
              sizes="(min-width: 1024px) 40vw, 90vw"
              priority
              className="object-contain p-fluid-lg"
            />
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent p-fluid-md">
              <span className="kyron-label text-fluid-2xs text-kyron-white">iPhone · toda a linha Apple</span>
              <span className="kyron-label rounded-full bg-kyron-blue px-fluid-xs py-1 text-fluid-2xs text-white">Novo · lacrado</span>
            </div>
          </div>

          {/* Links rápidos das linhas */}
          <ul className="mt-fluid-sm flex flex-wrap justify-center gap-fluid-2xs">
            {LINHAS.map((l) => (
              <li key={l.nome}>
                <Link
                  href={l.href}
                  className="kyron-label inline-block rounded-full border border-[var(--kyron-hairline)] px-fluid-sm py-1 text-fluid-2xs text-kyron-silver/80 transition-colors hover:border-[var(--kyron-blue-line)] hover:text-kyron-white"
                >
                  {l.nome}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
