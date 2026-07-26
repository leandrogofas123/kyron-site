import Link from "next/link";
import { notFound } from "next/navigation";

import { ProdutoForm } from "@/components/admin/ProdutoForm";
import { getCategoriasPlanas } from "@/lib/catalogo";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditarProduto({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const produtoId = Number(id);
  if (!Number.isInteger(produtoId)) notFound();

  const [produto, categorias] = await Promise.all([
    db.produto.findUnique({
      where: { id: produtoId },
      include: {
        imagens: { orderBy: [{ principal: "desc" }, { ordem: "asc" }] },
        seminovo: true,
      },
    }),
    getCategoriasPlanas(),
  ]);

  if (!produto) notFound();

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
        Editar produto
      </h1>
      <ProdutoForm
        categorias={opcoes}
        produto={{
          id: produto.id,
          nome: produto.nome,
          marca: produto.marca,
          compatibilidade: produto.compatibilidade,
          categoriaId: produto.categoriaId,
          preco: produto.preco,
          precoPromo: produto.precoPromo,
          descricaoCurta: produto.descricaoCurta,
          descricaoLonga: produto.descricaoLonga,
          destaque: produto.destaque,
          ativo: produto.ativo,
          imagens: produto.imagens.map((i) => ({
            id: i.id,
            url: i.url,
            principal: i.principal,
          })),
          seminovo: produto.seminovo
            ? {
                saudeBateria: produto.seminovo.saudeBateria,
                condicaoEstetica: produto.seminovo.condicaoEstetica,
                cor: produto.seminovo.cor,
                capacidade: produto.seminovo.capacidade,
                garantiaMeses: produto.seminovo.garantiaMeses,
                vendido: produto.seminovo.vendido,
              }
            : null,
        }}
      />
    </>
  );
}
