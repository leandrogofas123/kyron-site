"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

import {
  lerConsentimento,
  type Consentimento,
} from "@/lib/kyron/consentimento";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/**
 * Medição de audiência — carregada SOMENTE após consentimento explícito.
 *
 * O script do Google não entra no HTML enquanto o visitante não aceitar. Isso
 * é mais estrito que o Consent Mode (que carrega o script e depois restringe),
 * e é a leitura mais segura da LGPD: sem aceite, nenhum terceiro recebe o IP
 * do visitante.
 *
 * Sem NEXT_PUBLIC_GA_ID configurado, o componente não renderiza nada — o site
 * funciona normalmente e o banner continua registrando a escolha.
 */
export function Analytics() {
  const [permitido, setPermitido] = useState(false);

  useEffect(() => {
    setPermitido(lerConsentimento()?.analytics === true);

    const aoMudar = (evento: Event) => {
      const registro = (evento as CustomEvent<Consentimento>).detail;
      setPermitido(registro.analytics === true);
    };

    window.addEventListener("kyron:consentimento", aoMudar);
    return () => window.removeEventListener("kyron:consentimento", aoMudar);
  }, []);

  if (!GA_ID || !permitido) return null;

  return (
    <>
      {/*
        afterInteractive, não lazyOnload.
        Este componente só monta DEPOIS do aceite — ou seja, depois do evento
        de carga da página. lazyOnload espera esse evento, que já passou, e o
        script nunca é injetado.
      */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="kyron-ga" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            anonymize_ip: true,
            allow_google_signals: false,
            allow_ad_personalization_signals: false
          });
        `}
      </Script>
    </>
  );
}

/**
 * Registra uma conversão. Não faz nada sem consentimento — a checagem do
 * gtag no window já cobre isso, porque ele só existe após o aceite.
 *
 * Eventos previstos: form_submit · schedule_click · whatsapp_click ·
 * practice_view · chat_open · chat_lead
 */
export function registrarEvento(
  nome: string,
  parametros?: Record<string, string | number | boolean>,
) {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void })
    .gtag;
  gtag?.("event", nome, parametros);
}
