import Link from "next/link";
import { notFound } from "next/navigation";

import { ProdutoErpForm } from "@/components/erp/ProdutoErpForm";
import { colaboradorLogado, podeFazer } from "@/lib/erp/auth";
import { historicoProduto, rotuloTipo } from "@/lib/erp/estoque";
import { categoriasParaSelecao, listarFornecedores, obterProduto } from "@/lib/erp/produtos";

export const dynamic = "force-dynamic";

function quando(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default async function ProdutoErpDetalhe({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const produtoId = Number(id);
  if (!Number.isInteger(produtoId)) notFound();

  const [eu, produto, categorias, fornecedores, historico] = await Promise.all([
    colaboradorLogado(),
    obterProduto(produtoId),
    categoriasParaSelecao(),
    listarFornecedores(),
    historicoProduto(produtoId),
  ]);

  if (!produto) notFound();
  const podeEditar = eu ? podeFazer(eu.papel, "produtos.editar") : false;

  return (
    <>
      <div className="mb-fluid-lg">
        <Link href="/erp/produtos" className="text-fluid-2xs text-kyron-silver hover:text-kyron-white">
          ← Produtos
        </Link>
        <h1 className="kyron-display mt-fluid-2xs text-fluid-xl text-kyron-white">
          {produto.nome}
        </h1>
        <p className="text-fluid-2xs text-kyron-silver/60">
          {produto.quantidade} em estoque · {produto.categoria.nome}
          {produto.fornecedor ? ` · ${produto.fornecedor.nome}` : ""}
        </p>
      </div>

      <div className="grid gap-fluid-xl xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)] xl:items-start">
        <div>
          {podeEditar ? (
            <ProdutoErpForm
              produto={{
                id: produto.id,
                nome: produto.nome,
                marca: produto.marca,
                modelo: produto.modelo,
                cor: produto.cor,
                capacidade: produto.capacidade,
                voltagem: produto.voltagem,
                sku: produto.sku,
                ean: produto.ean,
                ncm: produto.ncm,
                codigoInterno: produto.codigoInterno,
                localizacao: produto.localizacao,
                compatibilidade: produto.compatibilidade,
                descricaoCurta: produto.descricaoCurta,
                observacoes: produto.observacoes,
                garantiaMeses: produto.garantiaMeses,
                quantidadeMinima: produto.quantidadeMinima,
                quantidade: produto.quantidade,
                preco: produto.preco,
                precoCusto: produto.precoCusto,
                precoMinimo: produto.precoMinimo,
                categoriaId: produto.categoriaId,
                fornecedorId: produto.fornecedorId,
                ativo: produto.ativo,
              }}
              categorias={categorias}
              fornecedores={fornecedores.map((f) => ({ id: f.id, nome: f.nome }))}
            />
          ) : (
            <p className="text-fluid-sm text-kyron-silver">
              Você tem permissão apenas para consultar este produto.
            </p>
          )}
        </div>

        <aside>
          <h2 className="kyron-label mb-fluid-sm text-fluid-2xs text-kyron-silver/70">
            Histórico do produto
          </h2>
          {historico.length === 0 ? (
            <p className="text-fluid-2xs text-kyron-silver/60">
              Nenhuma movimentação registrada.
            </p>
          ) : (
            <ol className="space-y-fluid-2xs">
              {historico.map((m) => (
                <li
                  key={m.id}
                  className="rounded-kyron-sm border border-[var(--kyron-hairline)] px-fluid-sm py-fluid-xs"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-fluid-sm text-kyron-white">
                      {rotuloTipo(m.tipo)}
                    </span>
                    <span className="text-fluid-2xs text-kyron-silver">
                      {m.saldoAntes} → {m.saldoDepois}
                    </span>
                  </div>
                  <p className="text-fluid-2xs text-kyron-silver/60">
                    {quando(m.criadoEm)}
                    {m.colaborador ? ` · ${m.colaborador.nome}` : ""}
                    {m.documento ? ` · ${m.documento}` : ""}
                  </p>
                  {m.motivo && (
                    <p className="mt-0.5 text-fluid-2xs text-kyron-silver">{m.motivo}</p>
                  )}
                </li>
              ))}
            </ol>
          )}
        </aside>
      </div>
    </>
  );
}
