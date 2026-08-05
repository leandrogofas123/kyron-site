import Link from "next/link";

import { BotaoVendido } from "@/components/erp/BotaoVendido";
import { ProdutoLink } from "@/components/erp/ProdutoLink";
import { formatarPreco } from "@/lib/format";
import { colaboradorLogado, podeFazer } from "@/lib/erp/auth";
import { listarProdutos } from "@/lib/erp/produtos";

export const dynamic = "force-dynamic";

const ABAS = [
  { id: "", label: "Todos" },
  { id: "novo", label: "Novos" },
  { id: "seminovo", label: "Seminovos" },
] as const;

export default async function ErpProdutos({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; baixos?: string; tipo?: string }>;
}) {
  const { q, baixos, tipo } = await searchParams;
  const tipoValido = tipo === "novo" || tipo === "seminovo" ? tipo : undefined;
  const [eu, produtos] = await Promise.all([
    colaboradorLogado(),
    listarProdutos({ q, apenasBaixos: baixos === "1", tipo: tipoValido }),
  ]);
  const podeEditar = eu ? podeFazer(eu.papel, "produtos.editar") : false;
  const ehSeminovos = tipoValido === "seminovo";

  // Preserva os filtros ao trocar de aba / alternar estoque baixo.
  const href = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const base = { q, baixos, tipo, ...patch };
    if (base.q) params.set("q", base.q);
    if (base.baixos) params.set("baixos", base.baixos);
    if (base.tipo) params.set("tipo", base.tipo);
    const s = params.toString();
    return s ? `/erp/produtos?${s}` : "/erp/produtos";
  };

  return (
    <>
      <div className="mb-fluid-md flex flex-wrap items-end justify-between gap-fluid-sm">
        <div>
          <h1 className="kyron-display text-fluid-xl text-kyron-white">Produtos</h1>
          <p className="text-fluid-2xs text-kyron-silver/60">
            {produtos.length} item(ns)
            {ehSeminovos && ` · ${produtos.filter((p) => !p.seminovo?.vendido).length} disponíveis · ${produtos.filter((p) => p.seminovo?.vendido).length} vendidos`}
            {baixos === "1" && " · só estoque baixo"}
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

      {/* Abas: Todos · Novos · Seminovos */}
      <div className="mb-fluid-md flex flex-wrap gap-fluid-2xs">
        {ABAS.map((a) => {
          const ativo = (tipoValido ?? "") === a.id;
          return (
            <Link
              key={a.id}
              href={href({ tipo: a.id || undefined })}
              className={`kyron-label rounded-kyron-sm border px-fluid-md py-fluid-2xs text-fluid-2xs transition-colors ${
                ativo
                  ? "border-[var(--kyron-blue-line)] bg-kyron-blue/10 text-kyron-blue"
                  : "border-[var(--kyron-hairline-strong)] text-kyron-silver hover:text-kyron-white"
              }`}
            >
              {a.label}
            </Link>
          );
        })}
      </div>

      <form action="/erp/produtos" className="mb-fluid-md flex flex-wrap gap-fluid-xs">
        {tipoValido && <input type="hidden" name="tipo" value={tipoValido} />}
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
          href={href({ baixos: baixos === "1" ? undefined : "1" })}
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
          <table className="w-full min-w-[46rem] border-collapse text-fluid-sm">
            <thead>
              <tr className="border-b border-[var(--kyron-hairline)] text-left">
                <Th>Produto</Th>
                <Th>{ehSeminovos ? "Condição" : "SKU / EAN"}</Th>
                <Th>Categoria</Th>
                <Th className="text-right">Custo</Th>
                <Th className="text-right">Venda</Th>
                <Th className="text-right">{ehSeminovos ? "Situação" : "Estoque"}</Th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((p) => {
                const baixo =
                  p.quantidadeMinima > 0 && p.quantidade <= p.quantidadeMinima;
                const vendido = p.seminovo?.vendido ?? false;
                return (
                  <tr
                    key={p.id}
                    className={`border-b border-[var(--kyron-hairline)] ${
                      p.ativo && !vendido ? "" : "opacity-55"
                    }`}
                  >
                    <Td>
                      <ProdutoLink id={p.id} nome={p.nome} podeEditar={podeEditar} />
                      {p.seminovo && !ehSeminovos && (
                        <span className="kyron-label ml-2 rounded-kyron-sm bg-kyron-blue/12 px-1.5 py-0.5 text-fluid-2xs text-kyron-blue">
                          seminovo
                        </span>
                      )}
                      {!p.ativo && (
                        <span className="kyron-label ml-2 text-fluid-2xs text-kyron-silver/60">
                          inativo
                        </span>
                      )}
                    </Td>
                    <Td className="text-fluid-2xs text-kyron-silver/70">
                      {p.seminovo
                        ? [
                            p.seminovo.condicaoEstetica,
                            p.seminovo.saudeBateria != null ? `bateria ${p.seminovo.saudeBateria}%` : null,
                          ].filter(Boolean).join(" · ") || "—"
                        : `${p.sku ?? "—"} ${p.ean ? `· ${p.ean}` : ""}`}
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
                    <Td className="text-right">
                      {p.seminovo ? (
                        <div className="flex items-center justify-end gap-fluid-sm">
                          <span className={`kyron-label text-fluid-2xs ${vendido ? "text-kyron-silver/60" : "text-kyron-blue"}`}>
                            {vendido ? "vendido" : "disponível"}
                          </span>
                          {podeEditar && <BotaoVendido produtoId={p.id} vendido={vendido} />}
                        </div>
                      ) : (
                        <span className={`font-semibold ${baixo ? "text-kyron-blue" : "text-kyron-white"}`}>
                          {p.quantidade}
                          {baixo && (
                            <span className="ml-1 text-fluid-2xs font-normal">
                              / {p.quantidadeMinima}
                            </span>
                          )}
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
