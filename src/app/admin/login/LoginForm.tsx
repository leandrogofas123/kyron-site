"use client";

import { useActionState } from "react";

import { acaoLogin } from "@/lib/admin-actions";

export function LoginForm() {
  const [estado, formAction, pendente] = useActionState(acaoLogin, null);

  return (
    <form action={formAction} className="space-y-fluid-sm">
      <div>
        <label
          htmlFor="senha"
          className="kyron-label mb-fluid-2xs block text-fluid-2xs text-kyron-silver/70"
        >
          Senha
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          className="w-full rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-graphite px-fluid-sm py-fluid-xs text-fluid-base text-kyron-white focus:border-[var(--kyron-blue-line)] focus:outline-none"
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
        {pendente ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
