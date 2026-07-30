"use client";

import { useActionState, useTransition } from "react";

import { acaoAtualizarOS, acaoStatusOS } from "@/lib/ordens/acoes";
import { STATUS_OS } from "@/lib/ordens/status";

const campo =
  "w-full rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-graphite px-fluid-sm py-fluid-2xs text-fluid-2xs text-kyron-white focus:border-[var(--kyron-blue-line)] focus:outline-none";
const rotulo = "kyron-label mb-1 block text-fluid-2xs text-kyron-silver/60";

type OS = {
  id: number;
  status: string;
  diagnostico: string | null;
  solucao: string | null;
  valor: number | null;
  garantiaMeses: number;
  tecnicoId: number | null;
  tecnicoNome: string | null;
};

export function ControleOS({
  os,
  tecnicos,
}: {
  os: OS;
  tecnicos: { id: number; nome: string }[];
}) {
  const atualizar = acaoAtualizarOS.bind(null, os.id);
  const [estado, action, pendente] = useActionState(atualizar, null);
  const [transicao, start] = useTransition();

  return (
    <div className="grid gap-fluid-md xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-start">
      <form
        action={action}
        className="rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-md"
      >
        <h2 className="kyron-label mb-fluid-sm text-fluid-2xs text-kyron-silver/70">
          Laudo técnico
        </h2>
        <label className="mb-fluid-xs block">
          <span className={rotulo}>Diagnóstico</span>
          <textarea name="diagnostico" rows={2} defaultValue={os.diagnostico ?? ""} className={campo} />
        </label>
        <label className="mb-fluid-xs block">
          <span className={rotulo}>Solução aplicada</span>
          <textarea name="solucao" rows={2} defaultValue={os.solucao ?? ""} className={campo} />
        </label>
        <div className="grid grid-cols-2 gap-fluid-xs sm:grid-cols-3">
          <label>
            <span className={rotulo}>Valor (R$)</span>
            <input
              name="valor"
              inputMode="decimal"
              defaultValue={os.valor != null ? (os.valor / 100).toFixed(2).replace(".", ",") : ""}
              className={campo}
            />
          </label>
          <label>
            <span className={rotulo}>Garantia (meses)</span>
            <input
              name="garantiaMeses"
              inputMode="numeric"
              defaultValue={os.garantiaMeses || ""}
              className={campo}
            />
          </label>
          <label>
            <span className={rotulo}>Técnico</span>
            <select
              name="tecnicoId"
              defaultValue={os.tecnicoId ?? ""}
              className={campo}
              onChange={(e) => {
                const nome = e.target.selectedOptions[0]?.text ?? "";
                const hidden = e.currentTarget.form?.elements.namedItem(
                  "tecnicoNome",
                ) as HTMLInputElement | null;
                if (hidden) hidden.value = e.target.value ? nome : "";
              }}
            >
              <option value="">—</option>
              {tecnicos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>
            <input type="hidden" name="tecnicoNome" defaultValue={os.tecnicoNome ?? ""} />
          </label>
        </div>
        {estado?.ok && (
          <p className="mt-fluid-xs text-fluid-2xs text-kyron-silver/60">Salvo.</p>
        )}
        <button
          type="submit"
          disabled={pendente}
          className="kyron-label mt-fluid-sm rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-2xs text-fluid-2xs text-white transition-all hover:-translate-y-px disabled:opacity-50"
        >
          {pendente ? "Salvando…" : "Salvar laudo"}
        </button>
      </form>

      <div className="rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-md">
        <h2 className="kyron-label mb-fluid-sm text-fluid-2xs text-kyron-silver/70">
          Status
        </h2>
        <div className="flex flex-wrap gap-fluid-2xs">
          {STATUS_OS.map((s) => {
            const ativo = s.id === os.status;
            return (
              <button
                key={s.id}
                type="button"
                disabled={transicao || ativo}
                onClick={() => start(async () => void (await acaoStatusOS(os.id, s.id)))}
                className={`kyron-label rounded-kyron-sm border px-fluid-sm py-1 text-fluid-2xs transition-colors disabled:opacity-100 ${
                  ativo
                    ? "border-[var(--kyron-blue-line)] text-kyron-blue"
                    : "border-[var(--kyron-hairline-strong)] text-kyron-silver hover:text-kyron-white"
                }`}
              >
                {s.rotulo}
              </button>
            );
          })}
        </div>
        <p className="mt-fluid-sm text-fluid-2xs text-kyron-silver/50">
          Ao <strong>concluir</strong>, se houver valor, gera conta a receber e
          registra na ficha do cliente. Ao <strong>entregar</strong>, ativa a
          garantia.
        </p>
      </div>
    </div>
  );
}
