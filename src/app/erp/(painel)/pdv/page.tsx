import { PdvClient } from "@/components/pdv/PdvClient";
import { colaboradorLogado, podeFazer } from "@/lib/erp/auth";
import { listarAtivas } from "@/lib/pdv/maquininhas";
import { vendedoresPDV } from "@/lib/pdv/pdv";

export const dynamic = "force-dynamic";

export default async function ErpPdv() {
  const eu = await colaboradorLogado();
  if (!eu || !podeFazer(eu.papel, "estoque.movimentar")) {
    return (
      <div className="mx-auto max-w-[40rem] rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-lg text-center">
        <h1 className="kyron-display text-fluid-lg text-kyron-white">Acesso restrito</h1>
        <p className="mt-fluid-sm text-fluid-base text-kyron-silver">
          Você não tem permissão para registrar vendas.
        </p>
      </div>
    );
  }

  const [vendedores, maquininhas] = await Promise.all([vendedoresPDV(), listarAtivas()]);

  return (
    <>
      <div className="mb-fluid-lg">
        <h1 className="kyron-display text-fluid-xl text-kyron-white">Venda rápida</h1>
        <p className="text-fluid-2xs text-kyron-silver/60">
          Bipe ou busque o produto, feche a venda. Baixa estoque, lança no caixa e
          registra no cliente automaticamente.
        </p>
      </div>

      <PdvClient vendedores={vendedores} maquininhas={maquininhas} />
    </>
  );
}
