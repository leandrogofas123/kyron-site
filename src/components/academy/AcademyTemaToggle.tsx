"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

/**
 * Botão de tema (claro/escuro) da Kyron Academy. Mesmo mecanismo do
 * `TemaToggle` do site (`data-tema` no <html>, chave `kyron-tema` no
 * localStorage) — a escolha é uma só em todo o domínio (site, ERP e
 * Academy), só o visual do botão muda para caber na topbar da Academy.
 */
export function AcademyTemaToggle() {
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
      className="academy-icon-btn"
      onClick={alternar}
      aria-label={claro ? "Mudar para tema escuro" : "Mudar para tema claro"}
      title={claro ? "Tema escuro" : "Tema claro"}
    >
      {claro ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}
