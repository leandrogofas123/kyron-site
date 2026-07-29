"use client";

import Link from "next/link";
import { useActionState } from "react";

import { acaoRedefinirSenha } from "@/lib/auth/actions";

const campo =
  "w-full rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-graphite px-fluid-sm py-fluid-xs text-fluid-base text-kyron-white focus:border-[var(--kyron-blue-line)] focus:outline-none";
const rotulo = "kyron-label mb-fluid-2xs block text-fluid-2xs text-kyron-silver/70";

export function FormRedefinirSenha({ token }: { token: string }) {
  const [estado, formAction, pendente] = useActionState(acaoRedefinirSenha, {});

  if (estado?.ok) {
    return (
      <div className="space-y-fluid-md text-center">
        <p role="status" className="text-fluid-sm text-kyron-silver">
          {estado.mensagem}
        </p>
        <Link
          href="/entrar"
          className="kyron-label inline-block rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-sm text-fluid-xs text-white"
        >
          Ir para o login
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-fluid-sm">
      <input type="hidden" name="token" value={token} />
      <div>
        <label htmlFor="senha" className={rotulo}>
          Nova senha
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          autoComplete="new-password"
          minLength={6}
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
        {pendente ? "Salvando…" : "Salvar nova senha"}
      </button>
    </form>
  );
}
