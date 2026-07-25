"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import { linkWhatsApp } from "@/lib/kyron/site";

import {
  BANNERS_AUTOMACAO,
  type BannerAutomacao as Banner,
  type IconeBanner,
} from "./banners-automacao";

const INTERVALO_MS = 5000;
const LIMIAR_SWIPE = 40;

const CTA_CLASSE =
  "kyron-label inline-flex items-center gap-2 rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-sm text-fluid-xs text-white transition-all duration-300 hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(30,107,255,0.28)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kyron-blue";

/**
 * Carrossel de Automação Residencial da Home. Sem biblioteca externa.
 *
 * - Rotação automática a cada 5s; setas e bolinhas reiniciam o contador.
 * - Pausa no hover, no foco por teclado e quando a aba fica em segundo plano.
 * - Respeita prefers-reduced-motion (não gira sozinho).
 * - Swipe no mobile, setas nas laterais, indicadores embaixo.
 * - Sem layout shift: todos os slides no DOM, altura estável; imagem/painel
 *   com proporção fixa.
 */
export function BannerAutomacao() {
  const banners = BANNERS_AUTOMACAO;
  const total = banners.length;

  const [index, setIndex] = useState(0);
  const [mouseDentro, setMouseDentro] = useState(false);
  const [focoDentro, setFocoDentro] = useState(false);
  const [ocultoNaAba, setOcultoNaAba] = useState(false);
  const [reduzido, setReduzido] = useState(false);
  const toqueX = useRef<number | null>(null);
  const baseId = useId();

  // Preferência de menos movimento — desliga a rotação automática.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const aplicar = () => setReduzido(mq.matches);
    aplicar();
    mq.addEventListener("change", aplicar);
    return () => mq.removeEventListener("change", aplicar);
  }, []);

  // Aba em segundo plano — não gasta ciclos girando escondido.
  useEffect(() => {
    const aplicar = () => setOcultoNaAba(document.hidden);
    document.addEventListener("visibilitychange", aplicar);
    return () => document.removeEventListener("visibilitychange", aplicar);
  }, []);

  const autoAtivo =
    total > 1 && !mouseDentro && !focoDentro && !ocultoNaAba && !reduzido;

  // Depender de `index` faz o timer reiniciar a cada troca — inclusive quando o
  // usuário clica nas setas/bolinhas. É o "reiniciar o contador dos 5s".
  useEffect(() => {
    if (!autoAtivo) return;
    const id = window.setTimeout(
      () => setIndex((i) => (i + 1) % total),
      INTERVALO_MS,
    );
    return () => window.clearTimeout(id);
  }, [index, autoAtivo, total]);

  const irPara = (i: number) => setIndex(((i % total) + total) % total);
  const anterior = () => irPara(index - 1);
  const proximo = () => irPara(index + 1);

  function aoSoltarToque(e: React.TouchEvent) {
    if (toqueX.current == null) return;
    const delta = e.changedTouches[0].clientX - toqueX.current;
    if (Math.abs(delta) > LIMIAR_SWIPE) {
      if (delta < 0) proximo();
      else anterior();
    }
    toqueX.current = null;
  }

  return (
    <section
      aria-roledescription="Carrossel"
      aria-label="Automação residencial"
      onMouseEnter={() => setMouseDentro(true)}
      onMouseLeave={() => setMouseDentro(false)}
      onFocusCapture={() => setFocoDentro(true)}
      onBlurCapture={() => setFocoDentro(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          anterior();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          proximo();
        }
      }}
    >
      <div className="relative">
        <div className="overflow-hidden rounded-kyron-lg border border-[var(--kyron-hairline)] bg-kyron-graphite">
          <div
            className="flex transition-transform duration-[450ms] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none"
            style={{ transform: `translateX(-${index * 100}%)` }}
            onTouchStart={(e) => {
              toqueX.current = e.touches[0].clientX;
            }}
            onTouchEnd={aoSoltarToque}
          >
            {banners.map((banner, i) => (
              <Slide
                key={banner.id}
                banner={banner}
                ativo={i === index}
                posicao={i + 1}
                total={total}
                idBase={`${baseId}-${i}`}
              />
            ))}
          </div>
        </div>

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={anterior}
              aria-label="Banner anterior"
              className="absolute left-[clamp(0.5rem,1.5vw,1rem)] top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--kyron-hairline-strong)] bg-kyron-black/55 text-kyron-silver backdrop-blur-md transition-colors duration-300 hover:border-[var(--kyron-blue-line)] hover:text-kyron-white"
            >
              <Chevron direcao="esquerda" />
            </button>
            <button
              type="button"
              onClick={proximo}
              aria-label="Próximo banner"
              className="absolute right-[clamp(0.5rem,1.5vw,1rem)] top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--kyron-hairline-strong)] bg-kyron-black/55 text-kyron-silver backdrop-blur-md transition-colors duration-300 hover:border-[var(--kyron-blue-line)] hover:text-kyron-white"
            >
              <Chevron direcao="direita" />
            </button>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="mt-fluid-sm flex items-center justify-center gap-2">
          {banners.map((banner, i) => (
            <button
              key={banner.id}
              type="button"
              onClick={() => irPara(i)}
              aria-label={`Ir para o banner ${i + 1}: ${banner.titulo}`}
              aria-current={i === index}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index
                  ? "w-6 bg-kyron-blue"
                  : "w-2 bg-kyron-silver/30 hover:bg-kyron-silver/60"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function Slide({
  banner,
  ativo,
  posicao,
  total,
  idBase,
}: {
  banner: Banner;
  ativo: boolean;
  posicao: number;
  total: number;
  idBase: string;
}) {
  const { cta } = banner;
  const ehWhats = "whatsapp" in cta;
  const href = ehWhats
    ? (linkWhatsApp(cta.whatsapp) ?? "/contato")
    : cta.href;
  // Slide fora de tela não recebe foco por teclado.
  const tab = ativo ? 0 : -1;

  return (
    <div
      role="group"
      aria-roledescription="Slide"
      aria-label={`${posicao} de ${total}`}
      aria-hidden={!ativo}
      className="min-w-full"
    >
      <div className="grid items-center gap-fluid-lg p-fluid-lg md:grid-cols-2">
        {/* Texto à esquerda (desktop) / em cima (mobile) */}
        <div className="text-left">
          <p className="kyron-label text-fluid-2xs tracking-[0.18em] text-kyron-blue">
            {banner.eyebrow}
          </p>
          <h3
            id={`${idBase}-titulo`}
            className="kyron-display mt-fluid-xs text-fluid-2xl text-kyron-white"
          >
            {banner.titulo}
          </h3>
          <p className="mt-fluid-sm max-w-[46ch] text-fluid-base text-kyron-silver">
            {banner.texto}
          </p>

          {banner.itens && banner.itens.length > 0 && (
            <ul className="mt-fluid-md flex flex-wrap gap-fluid-sm">
              {banner.itens.map((item) => (
                <li
                  key={item}
                  className="inline-flex items-center gap-1.5 text-fluid-sm text-kyron-silver"
                >
                  <Check />
                  {item}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-fluid-lg">
            {ehWhats ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={tab}
                className={CTA_CLASSE}
              >
                {cta.label}
              </a>
            ) : (
              <Link href={href} tabIndex={tab} className={CTA_CLASSE}>
                {cta.label}
              </Link>
            )}
          </div>
        </div>

        {/* Imagem à direita (desktop) / embaixo (mobile) */}
        <VisualBanner banner={banner} />
      </div>
    </div>
  );
}

function VisualBanner({ banner }: { banner: Banner }) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-black">
      {banner.imagem ? (
        <Image
          src={banner.imagem.src}
          alt={banner.imagem.alt}
          fill
          sizes="(min-width: 768px) 42vw, 88vw"
          className="object-cover"
        />
      ) : (
        <PainelGrafico icone={banner.icone} />
      )}
    </div>
  );
}

/** Painel da marca quando não há foto real: glow azul + ícone do tema. */
function PainelGrafico({ icone }: { icone: IconeBanner }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_65%_35%,rgba(30,107,255,0.22),transparent_62%)]">
      <span className="text-kyron-blue/90">
        <IconeTema icone={icone} />
      </span>
    </div>
  );
}

function IconeTema({ icone }: { icone: IconeBanner }) {
  const comum = {
    width: 76,
    height: 76,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (icone) {
    case "casa":
      return (
        <svg {...comum}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V21h14V9.5" />
          <path d="M10 21v-6h4v6" />
        </svg>
      );
    case "controle":
      return (
        <svg {...comum}>
          <rect x="4" y="2.5" width="8" height="19" rx="3" />
          <circle cx="8" cy="7" r="1" />
          <path d="M8 11v3" />
          <path d="M15.5 7a6 6 0 0 1 0 10" />
          <path d="M18 4.5a9.5 9.5 0 0 1 0 15" />
        </svg>
      );
    case "voz":
      return (
        <svg {...comum}>
          <rect x="9" y="2.5" width="6" height="11" rx="3" />
          <path d="M5 11a7 7 0 0 0 14 0" />
          <path d="M12 18v3" />
          <path d="M9 21h6" />
        </svg>
      );
    case "instalacao":
      return (
        <svg {...comum}>
          <path d="M14.5 5.5a3.5 3.5 0 0 0-4.7 4.3L4 15.6 6.4 18l5.8-5.8a3.5 3.5 0 0 0 4.3-4.7l-2.2 2.2-1.8-.4-.4-1.8 2.4-2.2Z" />
          <path d="m16 16 4 4" />
        </svg>
      );
  }
}

function Chevron({ direcao }: { direcao: "esquerda" | "direita" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={direcao === "esquerda" ? "m15 6-6 6 6 6" : "m9 6 6 6-6 6"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Check() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0 text-kyron-blue"
    >
      <path
        d="m5 12 5 5 9-11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
