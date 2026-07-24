"use client";

import { abrirPreferenciasCookies } from "@/lib/kyron/consentimento";

/** Reabre o painel de cookies. Exigência da LGPD: a escolha deve ser revogável. */
export function BotaoPreferenciasCookies() {
  return (
    <button
      type="button"
      onClick={abrirPreferenciasCookies}
      className="inline-block py-1.5 text-left hover:text-kyron-silver"
    >
      Preferências de cookies
    </button>
  );
}
