import { redirect } from "next/navigation";

import { ProdutoErpForm } from "@/components/erp/ProdutoErpForm";
import { colaboradorLogado, podeFazer } from "@/lib/erp/auth";
import { categoriasParaSelecao, listarFornecedores } from "@/lib/erp/produtos";

export const dynamic = "force-dynamic";

export default async function NovoProdutoErp() {
  const eu = await colaboradorLogado();
  if (!eu || !podeFazer(eu.papel, "produtos.editar")) redirect("/erp/produtos");

  const [categorias, fornecedores] = await Promise.all([
    categoriasParaSelecao(),
    listarFornecedores(),
  ]);

  return (
    <>
      <h1 className="kyron-display mb-fluid-lg text-fluid-xl text-kyron-white">
        Novo produto
      </h1>
      <ProdutoErpForm
        categorias={categorias}
        fornecedores={fornecedores.map((f) => ({ id: f.id, nome: f.nome }))}
      />
    </>
  );
}
