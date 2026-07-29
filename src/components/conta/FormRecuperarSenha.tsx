"use client";

import { useActionState } from "react";

import { acaoRecuperarSenha } from "@/lib/auth/actions";

const campo =
  "w-full rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-graphite px-fluid-sm py-fluid-xs text-fluid-base text-kyron-white focus:border-[var(--kyron-blue-line)] focus:outline-none";
const rotulo = "kyron-label mb-fluid-2xs block text-fluid-2xs text-kyron-silver/70";

export function FormRecuperarSenha() {
  const [estado, formAction, pendente] = useActionState(acaoRecuperarSenha, {});

  if (estado?.ok) {
    return (
      <p role="status" className="text-fluid-sm text-kyron-silver">
        {estado.mensagem}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-fluid-sm">
      <div>
        <label htmlFor="email" className={rotulo}>
          E-mail da conta
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          autoFocus
          className={campo}
        />
      </div>

      {estado?.erro && (
        <p role="alert" className="text-fluid-xs text-kyron-blue">
          {estado.erro}
        </p>
      )}

      <button
        type="submit"
        disabled={pendente}
        className="kyron-label w-full rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-sm text-fluid-xs text-white transition-all duration-300 hover:-translate-y-px disabled:opacity-50"
      >
        {pendente ? "Enviando…" : "Enviar instruções"}
      </button>
    </form>
  );
}
