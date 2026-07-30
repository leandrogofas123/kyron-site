"use client";

import { useActionState } from "react";

import { acaoSalvarConfig } from "@/lib/configuracao/acoes";

const campo =
  "w-full rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-graphite px-fluid-sm py-fluid-2xs text-fluid-2xs text-kyron-white focus:border-[var(--kyron-blue-line)] focus:outline-none";
const rotulo = "kyron-label mb-1 block text-fluid-2xs text-kyron-silver/60";

export function ConfigForm({
  valores,
}: {
  valores: { avisoAtivo: boolean; avisoTexto: string; horario: string };
}) {
  const [estado, action, pendente] = useActionState(acaoSalvarConfig, null);

  return (
    <form action={action} className="max-w-[42rem] space-y-fluid-md">
      <div className="rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-md">
        <label className="flex items-center gap-fluid-xs">
          <input
            type="checkbox"
            name="aviso_ativo"
            defaultChecked={valores.avisoAtivo}
            className="h-4 w-4 accent-kyron-blue"
          />
          <span className="text-fluid-sm text-kyron-white">Mostrar aviso no topo do site</span>
        </label>
        <label className="mt-fluid-sm block">
          <span className={rotulo}>Texto do aviso</span>
          <textarea
            name="aviso_texto"
            rows={2}
            maxLength={240}
            defaultValue={valores.avisoTexto}
            placeholder="Ex.: Fechado no feriado de 15/11 · Promoção de seminovos esta semana!"
            className={campo}
          />
        </label>
        <p className="mt-fluid-2xs text-fluid-2xs text-kyron-silver/50">
          Aparece como uma faixa para todos os visitantes. Desmarque para esconder.
        </p>
      </div>

      <div className="rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-md">
        <label className="block">
          <span className={rotulo}>Horário / atendimento</span>
          <input name="horario" defaultValue={valores.horario} maxLength={240} className={campo} />
        </label>
      </div>

      {estado?.ok && (
        <p role="status" className="text-fluid-2xs text-kyron-silver/60">
          Salvo. O site atualiza em alguns segundos.
        </p>
      )}
      {estado?.erro && (
        <p role="alert" className="text-fluid-2xs text-kyron-blue">
          {estado.erro}
        </p>
      )}

      <button
        type="submit"
        disabled={pendente}
        className="kyron-label rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-sm text-fluid-xs text-white transition-all hover:-translate-y-px disabled:opacity-50"
      >
        {pendente ? "Salvando…" : "Salvar configurações"}
      </button>
    </form>
  );
}
