"use client";

import { useTransition } from "react";

import { acaoBaixarConta, acaoCancelarConta } from "@/lib/financeiro/acoes";

export function AcoesConta({ contaId }: { contaId: number }) {
  const [pendente, start] = useTransition();

  return (
    <div className="flex shrink-0 gap-2">
      <button
        type="button"
        disabled={pendente}
        onClick={() => start(async () => void (await acaoBaixarConta(contaId)))}
        className="kyron-label rounded-kyron-sm bg-kyron-blue px-fluid-sm py-1 text-fluid-2xs text-white transition-all hover:-translate-y-px disabled:opacity-50"
      >
        Dar baixa
      </button>
      <button
        type="button"
        disabled={pendente}
        onClick={() => start(async () => void (await acaoCancelarConta(contaId)))}
        className="kyron-label rounded-kyron-sm border border-[var(--kyron-hairline-strong)] px-fluid-sm py-1 text-fluid-2xs text-kyron-silver transition-colors hover:text-kyron-white disabled:opacity-50"
      >
        Cancelar
      </button>
    </div>
  );
}
