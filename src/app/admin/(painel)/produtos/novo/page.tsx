import Link from "next/link";

import { ProdutoForm } from "@/components/admin/ProdutoForm";
import { getCategoriasPlanas } from "@/lib/catalogo";

export const dynamic = "force-dynamic";

export default async function NovoProduto() {
  const categorias = await getCategoriasPlanas();
  const opcoes = categorias.map((c) => ({
    id: c.id,
    label: c.parent ? `${c.parent.nome} › ${c.nome}` : c.nome,
  }));

  return (
    <>
      <Link href="/admin/produtos" className="text-fluid-2xs text-kyron-silver/60 hover:text-kyron-silver">
        ← Produtos
      </Link>
      <h1 className="kyron-display mb-fluid-lg mt-fluid-xs text-fluid-xl text-kyron-white">
        Novo produto
      </h1>
      <ProdutoForm categorias={opcoes} />
    </>
  );
}
