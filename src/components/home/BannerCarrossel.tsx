"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { BannerPublico } from "@/lib/site/banners";

/**
 * Carrossel de banners de uma posição do site. Rotação automática pelo tempo
 * configurado em cada banner. Respeita prefers-reduced-motion (não gira).
 */
export function BannerCarrossel({ banners }: { banners: BannerPublico[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (banners.length < 2) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const seg = banners[i]?.rotacaoSegundos ?? 6;
    const t = setTimeout(() => setI((v) => (v + 1) % banners.length), seg * 1000);
    return () => clearTimeout(t);
  }, [i, banners]);

  if (banners.length === 0) return null;
  const b = banners[i];

  const conteudo = (
    <div className="relative aspect-[16/6] w-full overflow-hidden rounded-kyron-md bg-kyron-graphite sm:aspect-[1600/600]">
      {/* Mobile usa a arte mobile quando houver; senão a desktop. */}
      {b.imagemMobile && (
        <Image src={b.imagemMobile} alt={b.titulo} fill priority sizes="100vw" className="object-cover sm:hidden" />
      )}
      <Image
        src={b.imagemDesktop}
        alt={b.titulo}
        fill
        priority
        sizes="100vw"
        className={`object-cover ${b.imagemMobile ? "hidden sm:block" : ""}`}
      />
      {b.botaoTexto && (
        <div className="absolute bottom-fluid-md left-fluid-md">
          <span className="kyron-label inline-block rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-xs text-fluid-xs text-white">
            {b.botaoTexto}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative">
      {b.link ? (
        <Link href={b.link} aria-label={b.titulo}>{conteudo}</Link>
      ) : (
        conteudo
      )}
      {banners.length > 1 && (
        <div className="mt-fluid-xs flex justify-center gap-1.5">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Banner ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all ${idx === i ? "w-5 bg-kyron-blue" : "w-1.5 bg-kyron-silver/30"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
