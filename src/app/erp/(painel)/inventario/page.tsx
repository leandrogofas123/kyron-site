import { Conferencia } from "@/components/erp/Conferencia";
import { colaboradorLogado, podeFazer } from "@/lib/erp/auth";
import { produtosParaContagem } from "@/lib/erp/inventario";

export const dynamic = "force-dynamic";

export default async function ErpInventario() {
  const eu = await colaboradorLogado();
  const pode = eu ? podeFazer(eu.papel, "estoque.movimentar") : false;

  if (!pode) {
    return (
      <div className="mx-auto max-w-[40rem] rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-lg text-center">
        <h1 className="kyron-display text-fluid-lg text-kyron-white">Acesso restrito</h1>
        <p className="mt-fluid-sm text-fluid-base text-kyron-silver">
          Você não tem permissão para movimentar estoque.
        </p>
      </div>
    );
  }

  const itens = await produtosParaContagem();

  return (
    <>
      <div className="mb-fluid-lg">
        <h1 className="kyron-display text-fluid-xl text-kyron-white">Inventário</h1>
        <p className="text-fluid-2xs text-kyron-silver/60">
          Conte o físico, compare com o sistema e ajuste. Cada ajuste vira um
          movimento no histórico, com seu nome e a divergência.
        </p>
      </div>

      <Conferencia itens={itens} />
    </>
  );
}
