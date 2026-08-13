"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

/**
 * Botão de tema (claro/escuro) do ERP. O ERP já herda automaticamente o
 * tema claro/escuro do site — reusa as mesmas variáveis `--color-kyron-*`
 * de globals.css, alternadas por `[data-tema="claro"]` no <html> — só não
 * tinha um botão próprio para trocar sem precisar ir até o site público.
 * Mesma chave `kyron-tema` no localStorage: a escolha é uma só no domínio.
 */
export function ErpTemaToggle() {
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
      title={claro ? "Tema escuro" : "Tema claro"}
      aria-label={claro ? "Mudar para tema escuro" : "Mudar para tema claro"}
      className="text-kyron-silver/70 hover:text-kyron-white"
    >
      {claro ? <Moon size={17} /> : <Sun size={17} />}
    </button>
  );
}
