"use client";

import { useEffect, useState } from "react";

import { linkWhatsApp } from "@/lib/kyron/site";

/**
 * Botão flutuante de WhatsApp — CTA fixo de conversão (spec §8.6).
 *
 * Na cor da marca com o ícone do WhatsApp: reconhecível pelo símbolo, dentro
 * da paleta do Manual (verde do WhatsApp ficaria fora da paleta).
 *
 * Fica ABAIXO do assistente na pilha do canto. Some junto com o banner de
 * cookies, para não cobri-lo no celular.
 */
export function FloatingWhatsApp() {
  const [cookiesAbertos, setCookiesAbertos] = useState(false);
  const href = linkWhatsApp(
    "Olá! Vim pelo site da Kyron e gostaria de mais informações.",
  );

  useEffect(() => {
    const aoMudar = (e: Event) =>
      setCookiesAbertos((e as CustomEvent<boolean>).detail === true);
    window.addEventListener("kyron:painel-cookies", aoMudar);
    return () => window.removeEventListener("kyron:painel-cookies", aoMudar);
  }, []);

  if (!href || cookiesAbertos) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-[clamp(1rem,3vw,1.5rem)] right-[clamp(1rem,3vw,1.5rem)] z-40 flex h-[clamp(3rem,7vw,3.5rem)] w-[clamp(3rem,7vw,3.5rem)] items-center justify-center rounded-full bg-kyron-blue text-white shadow-[0_8px_32px_rgba(30,107,255,0.32)] transition-transform duration-300 ease-in-out hover:-translate-y-0.5"
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.5A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 .9-2.2.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2 0 .4 0 .5l-.4.5c-.2.2-.3.4-.1.7.2.3.9 1.4 1.9 2.3 1.3 1.1 2.3 1.5 2.6 1.6.2 0 .4 0 .5-.1l.7-.9c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.4.3.1.2.1.7-.1 1.2Z" />
      </svg>
    </a>
  );
}
