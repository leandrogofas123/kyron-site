"use client";

import { BotaoNovaVenda } from "@/components/erp/BotaoNovaVenda";
import { ListaVendas } from "@/components/erp/ListaVendas";
import type { VendaLinha } from "@/lib/vendas/listar";

type Vendedor = { id: number; nome: string };
type Maquininha = { id: number; nome: string; taxaDebito: number; taxasCredito: Record<string, number> };

/**
 * Bloco de Vendas do Dashboard: atalho "Venda rápida" (PDV em popup, sem trocar
 * de página) e a tabela filtrável por período. Reutiliza BotaoNovaVenda e
 * ListaVendas — sem duplicar o fluxo de venda nem a tabela.
 */
export function PainelVendasDashboard({
  vendedores,
  maquininhas,
  vendas,
}: {
  vendedores: Vendedor[];
  maquininhas: Maquininha[];
  vendas: VendaLinha[];
}) {
  return (
    <section className="mt-fluid-xl">
      <div className="mb-fluid-sm flex items-center justify-between gap-fluid-sm">
        <h2 className="kyron-label text-fluid-2xs text-kyron-silver/70">Vendas</h2>
        <BotaoNovaVenda vendedores={vendedores} maquininhas={maquininhas} rotulo="Nova venda" />
      </div>

      <ListaVendas vendas={vendas} />
    </section>
  );
}
