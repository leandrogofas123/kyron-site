import Image from "next/image";
import Link from "next/link";

import { Section, SectionHeader } from "@/components/site/Section";

/**
 * Vitrine de categorias da Home — blocos ilustrados que levam a cada linha do
 * catálogo (ou às telas de seminovos/serviços). Ajuda a navegar e dá densidade
 * visual à entrada. Links apontam para os slugs reais das categorias.
 */

type Tile = { nome: string; desc: string; href: string; img: string };

const TILES: Tile[] = [
  { nome: "Apple", desc: "iPhone, iPad, Watch e AirPods novos — com nota.", href: "/produtos?categoria=apple", img: "/exemplos/iphone-novo.webp" },
  { nome: "iPhone seminovos", desc: "Avaliados e com garantia. Premium que cabe no bolso.", href: "/seminovos", img: "/exemplos/iphone-seminovo.webp" },
  { nome: "Casa Inteligente", desc: "Automação, câmeras, fechaduras e comando por voz.", href: "/produtos?categoria=casa-inteligente", img: "/automacao/automacao-residencial.jpg" },
  { nome: "Áudio", desc: "Fones e caixas de som para ouvir do seu jeito.", href: "/produtos?categoria=audio", img: "/exemplos/airpods.webp" },
  { nome: "Acessórios", desc: "Capas, películas, carregadores e cabos.", href: "/produtos?categoria=acessorios", img: "/exemplos/acessorio.webp" },
  { nome: "Assistência técnica", desc: "Diagnóstico e reparo, com avaliação antes do serviço.", href: "/servicos", img: "/exemplos/assistencia.jpg" },
];

export function VitrineCategorias() {
  return (
    <Section>
      <SectionHeader eyebrow="Categorias" titulo="Explore por linha." />
      <ul className="grid gap-fluid-sm sm:grid-cols-2 xl:grid-cols-3">
        {TILES.map((t) => (
          <li key={t.nome}>
            <Link
              href={t.href}
              className="group relative flex aspect-[16/10] overflow-hidden rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-black transition-colors hover:border-[var(--kyron-blue-line)]"
            >
              <Image
                src={t.img}
                alt={t.nome}
                fill
                sizes="(min-width: 1280px) 30vw, (min-width: 640px) 46vw, 92vw"
                className="object-cover opacity-80 transition-transform duration-[600ms] group-hover:scale-105 group-hover:opacity-100"
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
              <div className="relative mt-auto w-full p-fluid-md">
                <h3 className="kyron-display text-fluid-lg text-kyron-white">{t.nome}</h3>
                <p className="mt-1 max-w-[32ch] text-fluid-2xs text-kyron-silver/80">{t.desc}</p>
                <span className="kyron-label mt-fluid-xs inline-flex items-center gap-1.5 text-fluid-2xs text-kyron-blue">
                  Explorar
                  <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
