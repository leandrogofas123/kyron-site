"use client";

import { useActionState, useEffect, useRef } from "react";

import { registrarInteracaoCliente } from "@/lib/crm-actions";

const TIPOS: Array<[string, string]> = [
  ["whatsapp", "WhatsApp"],
  ["ligacao", "Ligação"],
  ["visita", "Visita"],
  ["email", "E-mail"],
  ["loja", "Atendimento na loja"],
  ["suporte", "Suporte"],
  ["observacao", "Observação"],
];

const campo =
  "rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-graphite px-fluid-sm py-fluid-2xs text-fluid-2xs text-kyron-white focus:border-[var(--kyron-blue-line)] focus:outline-none";

export function RegistrarInteracao({ clienteId }: { clienteId: number }) {
  const action = registrarInteracaoCliente.bind(null, clienteId);
  const [estado, formAction, pendente] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado?.ok) ref.current?.reset();
  }, [estado?.ok]);

  return (
    <form
      ref={ref}
      action={formAction}
      className="mb-fluid-md flex flex-wrap items-end gap-fluid-xs rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-sm"
    >
      <label className="flex flex-col gap-1">
        <span className="kyron-label text-fluid-2xs text-kyron-silver/60">Tipo</span>
        <select name="tipo" className={campo} defaultValue="whatsapp">
          {TIPOS.map(([v, r]) => (
            <option key={v} value={v}>
              {r}
            </option>
          ))}
        </select>
      </label>

      <label className="flex min-w-[12rem] flex-1 flex-col gap-1">
        <span className="kyron-label text-fluid-2xs text-kyron-silver/60">
          Anotação (opcional)
        </span>
        <input
          name="conteudo"
          type="text"
          placeholder="O que aconteceu nesse contato?"
          className={campo}
        />
      </label>

      <button
        type="submit"
        disabled={pendente}
        className="kyron-label rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-2xs text-fluid-2xs text-white transition-all hover:-translate-y-px disabled:opacity-50"
      >
        {pendente ? "Registrando…" : "Registrar"}
      </button>

      {estado?.erro && (
        <p role="alert" className="w-full text-fluid-2xs text-kyron-blue">
          {estado.erro}
        </p>
      )}
    </form>
  );
}
