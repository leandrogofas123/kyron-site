"use client";

import { useActionState } from "react";

import { acaoCriarConta } from "@/lib/usuario-actions";

const campo =
  "w-full rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-graphite px-fluid-sm py-fluid-xs text-fluid-base text-kyron-white focus:border-[var(--kyron-blue-line)] focus:outline-none";
const rotulo = "kyron-label mb-fluid-2xs block text-fluid-2xs text-kyron-silver/70";

export function FormCriarConta() {
  const [estado, formAction, pendente] = useActionState(acaoCriarConta, null);

  return (
    <form action={formAction} className="space-y-fluid-sm">
      <div>
        <label htmlFor="nome" className={rotulo}>
          Nome
        </label>
        <input
          id="nome"
          name="nome"
          autoComplete="name"
          required
          autoFocus
          className={campo}
        />
      </div>

      <div>
        <label htmlFor="email" className={rotulo}>
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={campo}
        />
      </div>

      <div>
        <label htmlFor="senha" className={rotulo}>
          Senha
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className={campo}
        />
        <p className="mt-fluid-2xs text-fluid-2xs text-kyron-silver/60">
          Mínimo de 8 caracteres.
        </p>
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
        {pendente ? "Criando conta…" : "Criar conta"}
      </button>
    </form>
  );
}
