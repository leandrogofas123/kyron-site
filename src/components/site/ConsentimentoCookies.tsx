"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import {
  anunciarPainelCookies,
  lerConsentimento,
  salvarConsentimento,
} from "@/lib/kyron/consentimento";

type Tela = "oculto" | "banner" | "preferencias";

export function ConsentimentoCookies() {
  const [tela, setTela] = useState<Tela>("oculto");
  const [analytics, setAnalytics] = useState(false);
  const primeiroBotao = useRef<HTMLButtonElement>(null);

  // Só decide o que mostrar depois de montar — localStorage não existe no
  // servidor, e renderizar o banner no HTML causaria erro de hidratação.
  useEffect(() => {
    const registro = lerConsentimento();
    if (!registro) {
      setTela("banner");
    } else {
      setAnalytics(registro.analytics);
    }

    const abrir = () => {
      setAnalytics(lerConsentimento()?.analytics ?? false);
      setTela("preferencias");
    };
    window.addEventListener("kyron:abrir-preferencias", abrir);
    return () => window.removeEventListener("kyron:abrir-preferencias", abrir);
  }, []);

  useEffect(() => {
    if (tela === "preferencias") primeiroBotao.current?.focus();
  }, [tela]);

  /**
   * Avisa o resto do site que o painel está ocupando a base da tela.
   * No celular ele cobriria o botão do assistente — resolver o consentimento
   * vem primeiro; o assistente reaparece logo depois.
   */
  useEffect(() => {
    anunciarPainelCookies(tela !== "oculto");
    return () => anunciarPainelCookies(false);
  }, [tela]);

  function decidir(aceitaAnalytics: boolean) {
    salvarConsentimento(aceitaAnalytics);
    setAnalytics(aceitaAnalytics);
    setTela("oculto");
  }

  if (tela === "oculto") return null;

  return (
    <div
      role="dialog"
      aria-modal={tela === "preferencias"}
      aria-labelledby="consentimento-titulo"
      className="fixed inset-x-0 bottom-0 z-[60] px-fluid-sm pb-fluid-sm"
    >
      <div className="mx-auto w-full max-w-[52rem] rounded-kyron-md border border-[var(--kyron-hairline-strong)] bg-kyron-graphite p-fluid-md shadow-[0_24px_64px_rgba(0,0,0,0.7)]">
        <h2
          id="consentimento-titulo"
          className="kyron-display text-fluid-base text-kyron-white"
        >
          {tela === "banner" ? "Cookies neste site" : "Preferências de cookies"}
        </h2>

        {tela === "banner" ? (
          <>
            <p className="mt-fluid-xs max-w-[62ch] text-fluid-sm text-kyron-silver">
              Usamos cookies essenciais para o site funcionar e, com a sua
              permissão, cookies de medição de audiência para entender como o
              site é usado. Você escolhe — e pode mudar depois.
            </p>

            <div className="mt-fluid-md flex flex-wrap gap-fluid-xs">
              <button
                type="button"
                onClick={() => decidir(true)}
                className="kyron-label rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-xs text-fluid-xs text-white transition-all duration-300 hover:-translate-y-px"
              >
                Aceitar todos
              </button>

              {/* Recusar tem o mesmo peso visual de aceitar: a LGPD exige que
                  recusar seja tão fácil quanto consentir. */}
              <button
                type="button"
                onClick={() => decidir(false)}
                className="kyron-label rounded-kyron-sm border border-[var(--kyron-hairline-strong)] px-fluid-md py-fluid-xs text-fluid-xs text-kyron-silver transition-colors duration-300 hover:border-[var(--kyron-blue-line)] hover:text-kyron-white"
              >
                Apenas essenciais
              </button>

              <button
                type="button"
                onClick={() => setTela("preferencias")}
                className="kyron-label px-fluid-xs py-fluid-xs text-fluid-xs text-kyron-silver underline underline-offset-4 transition-colors duration-300 hover:text-kyron-white"
              >
                Personalizar
              </button>
            </div>
          </>
        ) : (
          <>
            <ul className="mt-fluid-md space-y-fluid-sm">
              <li className="rounded-kyron-sm border border-[var(--kyron-hairline)] p-fluid-sm">
                <div className="flex items-start justify-between gap-fluid-sm">
                  <div>
                    <h3 className="text-fluid-sm font-semibold text-kyron-white">
                      Essenciais
                    </h3>
                    <p className="mt-1 max-w-[54ch] text-fluid-xs text-kyron-silver">
                      Necessários para o site carregar, manter sua escolha de
                      cookies e proteger o formulário contra envios automatizados.
                    </p>
                  </div>
                  <span className="kyron-label shrink-0 rounded-full border border-[var(--kyron-hairline-strong)] px-fluid-xs py-1 text-fluid-2xs text-kyron-silver/70">
                    Sempre ativos
                  </span>
                </div>
              </li>

              <li className="rounded-kyron-sm border border-[var(--kyron-hairline)] p-fluid-sm">
                <label className="flex cursor-pointer items-start justify-between gap-fluid-sm">
                  <span>
                    <span className="block text-fluid-sm font-semibold text-kyron-white">
                      Medição de audiência
                    </span>
                    <span className="mt-1 block max-w-[54ch] text-fluid-xs text-kyron-silver">
                      Mostram quantas pessoas visitam o site e quais páginas são
                      mais lidas, de forma agregada. Nunca usamos para publicidade.
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    className="mt-1 h-5 w-5 shrink-0 accent-[#1e6bff]"
                    aria-label="Permitir cookies de medição de audiência"
                  />
                </label>
              </li>
            </ul>

            <div className="mt-fluid-md flex flex-wrap items-center gap-fluid-xs">
              <button
                ref={primeiroBotao}
                type="button"
                onClick={() => decidir(analytics)}
                className="kyron-label rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-xs text-fluid-xs text-white transition-all duration-300 hover:-translate-y-px"
              >
                Salvar preferências
              </button>
              <button
                type="button"
                onClick={() => decidir(false)}
                className="kyron-label rounded-kyron-sm border border-[var(--kyron-hairline-strong)] px-fluid-md py-fluid-xs text-fluid-xs text-kyron-silver transition-colors duration-300 hover:border-[var(--kyron-blue-line)] hover:text-kyron-white"
              >
                Recusar tudo
              </button>
              <Link
                href="/politica-de-privacidade"
                className="kyron-label px-fluid-xs py-fluid-xs text-fluid-xs text-kyron-blue underline underline-offset-4"
              >
                Política de Privacidade
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
