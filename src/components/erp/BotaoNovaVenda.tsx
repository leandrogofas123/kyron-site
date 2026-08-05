"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { PdvClient } from "@/components/pdv/PdvClient";

type Vendedor = { id: number; nome: string };
type Maquininha = { id: number; nome: string; taxaDebito: number; taxasCredito: Record<string, number> };

/**
 * Botão "Venda rápida" que abre o PDV completo num popup — sem trocar de página.
 * Reutilizado no Dashboard e na tela de Vendas. Ao finalizar, atualiza a lista.
 */
export function BotaoNovaVenda({
  vendedores,
  maquininhas,
  rotulo = "Venda rápida",
}: {
  vendedores: Vendedor[];
  maquininhas: Maquininha[];
  rotulo?: string;
}) {
  const router = useRouter();
  const [modal, setModal] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setModal(true)}
        className="kyron-label inline-flex items-center gap-2 rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-xs text-fluid-xs text-white transition-all hover:-translate-y-px"
      >
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 5v14M5 12h14" /></svg>
        {rotulo}
      </button>

      {modal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-fluid-md" onClick={() => setModal(false)}>
          <div
            className="mx-auto my-fluid-md w-full max-w-[66rem] rounded-kyron-md border border-[var(--kyron-hairline-strong)] bg-kyron-black p-fluid-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-fluid-md flex items-center justify-between">
              <h3 className="kyron-display text-fluid-lg text-kyron-white">Venda rápida</h3>
              <button onClick={() => setModal(false)} aria-label="Fechar" className="text-kyron-silver/60 hover:text-kyron-white">✕</button>
            </div>
            <PdvClient vendedores={vendedores} maquininhas={maquininhas} onFinalizada={() => router.refresh()} />
          </div>
        </div>
      )}
    </>
  );
}
