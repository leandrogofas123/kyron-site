"use client";

import { useEffect, useState } from "react";

/**
 * Botão de tema (claro/escuro). Guarda a escolha em localStorage e alterna o
 * atributo data-tema no <html> — as variáveis de cor no globals fazem o resto.
 * O padrão é escuro; o claro deixa o site com fundo branco.
 */
export function TemaToggle() {
  const [claro, setClaro] = useState(false);

  useEffect(() => {
    setClaro(document.documentElement.getAttribute("data-tema") === "claro");
  }, []);

  function alternar() {
    const novo = claro ? "escuro" : "claro";
    document.documentElement.setAttribute("data-tema", novo);
    try {
      localStorage.setItem("kyron-tema", novo);
    } catch {
      /* modo privado: só não persiste */
    }
    setClaro(!claro);
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={claro ? "Mudar para tema escuro" : "Mudar para tema claro (fundo branco)"}
      title={claro ? "Tema escuro" : "Tema claro"}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-kyron-sm border border-[var(--kyron-blue-line)] bg-kyron-blue/12 text-kyron-blue shadow-[0_0_0_3px_rgba(30,107,255,0.08)] transition-all hover:-translate-y-px hover:bg-kyron-blue hover:text-white"
    >
      {claro ? (
        // Lua (indica que ao clicar vai para o escuro)
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      ) : (
        // Sol (indica que ao clicar vai para o claro)
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      )}
    </button>
  );
}
