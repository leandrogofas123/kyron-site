"use client";

import { useActionState } from "react";

import { acaoCriarOS } from "@/lib/ordens/acoes";

const campo =
  "w-full rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-graphite px-fluid-sm py-fluid-2xs text-fluid-2xs text-kyron-white focus:border-[var(--kyron-blue-line)] focus:outline-none";
const rotulo = "kyron-label mb-1 block text-fluid-2xs text-kyron-silver/60";

export function NovaOS({ clientes }: { clientes: { id: number; nome: string }[] }) {
  const [estado, action, pendente] = useActionState(acaoCriarOS, null);

  return (
    <form
      action={action}
      className="mb-fluid-xl rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-md"
    >
      <h2 className="kyron-label mb-fluid-sm text-fluid-2xs text-kyron-silver/70">
        Abrir ordem de serviço
      </h2>
      <div className="grid gap-fluid-xs sm:grid-cols-2">
        <label>
          <span className={rotulo}>Cliente (nome)</span>
          <input name="clienteNome" className={campo} placeholder="Nome de quem trouxe" />
        </label>
        <label>
          <span className={rotulo}>Vincular a cadastro (opcional)</span>
          <select name="clienteId" className={campo} defaultValue="">
            <option value="">— avulso —</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className={rotulo}>Equipamento</span>
          <input name="equipamento" className={campo} placeholder="Ex.: iPhone 13" />
        </label>
        <div className="grid grid-cols-2 gap-fluid-xs">
          <label>
            <span className={rotulo}>Marca</span>
            <input name="marca" className={campo} />
          </label>
          <label>
            <span className={rotulo}>Modelo</span>
            <input name="modelo" className={campo} />
          </label>
        </div>
        <label>
          <span className={rotulo}>IMEI</span>
          <input name="imei" className={campo} inputMode="numeric" />
        </label>
        <label>
          <span className={rotulo}>Nº série</span>
          <input name="serial" className={campo} />
        </label>
        <label className="sm:col-span-2">
          <span className={rotulo}>Defeito relatado</span>
          <input name="defeito" className={campo} placeholder="O que o cliente descreveu" />
        </label>
      </div>
      {estado?.erro && (
        <p role="alert" className="mt-fluid-xs text-fluid-2xs text-kyron-blue">
          {estado.erro}
        </p>
      )}
      <button
        type="submit"
        disabled={pendente}
        className="kyron-label mt-fluid-sm rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-2xs text-fluid-2xs text-white transition-all hover:-translate-y-px disabled:opacity-50"
      >
        {pendente ? "Abrindo…" : "Abrir OS"}
      </button>
    </form>
  );
}
