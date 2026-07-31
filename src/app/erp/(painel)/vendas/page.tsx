import { ListaVendas } from "@/components/erp/ListaVendas";
import { colaboradorLogado, podeFazer } from "@/lib/erp/auth";
import { listarVendas } from "@/lib/vendas/listar";

export const dynamic = "force-dynamic";

export default async function ErpVendas() {
  const eu = await colaboradorLogado();
  if (!eu || !podeFazer(eu.papel, "estoque.ver")) {
    return (
      <div className="mx-auto max-w-[40rem] rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-lg text-center">
        <h1 className="kyron-display text-fluid-lg text-kyron-white">Acesso restrito</h1>
        <p className="mt-fluid-sm text-fluid-base text-kyron-silver">
          Você não tem permissão para ver as vendas.
        </p>
      </div>
    );
  }

  const vendas = await listarVendas({ limite: 1000 });

  return (
    <>
      <div className="mb-fluid-lg">
        <h1 className="kyron-display text-fluid-xl text-kyron-white">Vendas</h1>
        <p className="text-fluid-2xs text-kyron-silver/60">
          Todas as vendas. Ordene clicando na coluna e filtre por texto, data ou
          valor. Clique no código para ver, imprimir o recibo ou estornar.
        </p>
      </div>

      <ListaVendas vendas={vendas} />
    </>
  );
}
