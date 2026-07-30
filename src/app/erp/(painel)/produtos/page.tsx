import Link from "next/link";

import { ProdutoLink } from "@/components/erp/ProdutoLink";
import { formatarPreco } from "@/lib/format";
import { colaboradorLogado, podeFazer } from "@/lib/erp/auth";
import { listarProdutos } from "@/lib/erp/produtos";

export const dynamic = "force-dynamic";

export default async function ErpProdutos({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; baixos?: string }>;
}) {
  const { q, baixos } = await searchParams;
  const [eu, produtos] = await Promise.all([
    colaboradorLogado(),
    listarProdutos({ q, apenasBaixos: baixos === "1" }),
  ]);
  const podeEditar = eu ? podeFazer(eu.papel, "produtos.editar") : false;

  return (
    <>
      <div className="mb-fluid-md flex flex-wrap items-end justify-between gap-fluid-sm">
        <div>
          <h1 className="kyron-display text-fluid-xl text-kyron-white">Produtos</h1>
          <p className="text-fluid-2xs text-kyron-silver/60">
            {produtos.length} item(ns){baixos === "1" && " · só estoque baixo"}
          </p>
        </div>
        {podeEditar && (
          <Link
            href="/erp/produtos/novo"
            className="kyron-label rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-sm text-fluid-2xs text-white transition-all hover:-translate-y-px"
          >
            Novo produto
          </Link>
        )}
      </div>

      <form action="/erp/produtos" className="mb-fluid-md flex flex-wrap gap-fluid-xs">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por nome, SKU, EAN, código, marca, modelo…"
          className="min-w-0 flex-1 rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-black px-fluid-sm py-fluid-xs text-fluid-sm text-kyron-white placeholder:text-kyron-silver/45 focus:border-[var(--kyron-blue-line)] focus:outline-none"
        />
        <button
          type="submit"
          className="kyron-label rounded-kyron-sm border border-[var(--kyron-hairline-strong)] px-fluid-md text-fluid-2xs text-kyron-white"
        >
          Buscar
        </button>
        <Link
          href={baixos === "1" ? "/erp/produtos" : "/erp/produtos?baixos=1"}
          className={`kyron-label flex items-center rounded-kyron-sm border px-fluid-md text-fluid-2xs ${
            baixos === "1"
              ? "border-[var(--kyron-blue-line)] text-kyron-blue"
              : "border-[var(--kyron-hairline-strong)] text-kyron-silver"
          }`}
        >
          Estoque baixo
        </Link>
      </form>

      {produtos.length === 0 ? (
        <p className="text-fluid-sm text-kyron-silver">
          Nenhum produto encontrado.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] border-collapse text-fluid-sm">
            <thead>
              <tr className="border-b border-[var(--kyron-hairline)] text-left">
                <Th>Produto</Th>
                <Th>SKU / EAN</Th>
                <Th>Categoria</Th>
                <Th className="text-right">Custo</Th>
                <Th className="text-right">Venda</Th>
                <Th className="text-right">Estoque</Th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((p) => {
                const baixo =
                  p.quantidadeMinima > 0 && p.quantidade <= p.quantidadeMinima;
                return (
                  <tr
                    key={p.id}
                    className={`border-b border-[var(--kyron-hairline)] ${
                      p.ativo ? "" : "opacity-55"
                    }`}
                  >
                    <Td>
                      <ProdutoLink id={p.id} nome={p.nome} podeEditar={podeEditar} />
                      {!p.ativo && (
                        <span className="kyron-label ml-2 text-fluid-2xs text-kyron-silver/60">
                          inativo
                        </span>
                      )}
                    </Td>
                    <Td className="text-fluid-2xs text-kyron-silver/70">
                      {p.sku ?? "—"} {p.ean ? `· ${p.ean}` : ""}
                    </Td>
                    <Td className="text-fluid-2xs text-kyron-silver/70">
                      {p.categoria.nome}
                    </Td>
                    <Td className="text-right text-kyron-silver">
                      {p.precoCusto != null ? formatarPreco(p.precoCusto) : "—"}
                    </Td>
                    <Td className="text-right text-kyron-white">
                      {formatarPreco(p.preco)}
                    </Td>
                    <Td
                      className={`text-right font-semibold ${
                        baixo ? "text-kyron-blue" : "text-kyron-white"
                      }`}
                    >
                      {p.quantidade}
                      {baixo && (
                        <span className="ml-1 text-fluid-2xs font-normal">
                          / {p.quantidadeMinima}
                        </span>
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`kyron-label py-fluid-xs pr-fluid-sm text-fluid-2xs font-normal text-kyron-silver/60 ${className}`}>
      {children}
    </th>
  );
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`py-fluid-xs pr-fluid-sm ${className}`}>{children}</td>;
}
