import Link from "next/link";

import { GraficoMovimentacao } from "@/components/erp/GraficoMovimentacao";
import { PainelVendasDashboard } from "@/components/erp/PainelVendasDashboard";
import { ProdutoLink } from "@/components/erp/ProdutoLink";
import { colaboradorLogado, podeFazer } from "@/lib/erp/auth";
import { db } from "@/lib/db";
import { formatarPreco } from "@/lib/format";
import { listarAtivas } from "@/lib/pdv/maquininhas";
import { vendedoresPDV } from "@/lib/pdv/pdv";
import { listarVendas } from "@/lib/vendas/listar";
import {
  DIAS_GRAFICO,
  garantiasAVencer,
  maisVendidos,
  serieMovimentacao,
  ultimasPorFluxo,
} from "@/lib/erp/dashboard";
import { rotuloTipo } from "@/lib/erp/estoque";

export const dynamic = "force-dynamic";

function dataCurta(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(d);
}

export default async function ErpDashboard() {
  const [eu, produtos, serie, vendidos, entradas, saidas, garantias, vendedores, maquininhas, vendas] =
    await Promise.all([
      colaboradorLogado(),
      db.produto.findMany({
        where: { excluidoEm: null },
        select: {
          id: true,
          nome: true,
          quantidade: true,
          quantidadeMinima: true,
          precoCusto: true,
          preco: true,
        },
      }),
      serieMovimentacao(),
      maisVendidos(),
      ultimasPorFluxo("entrada"),
      ultimasPorFluxo("saida"),
      garantiasAVencer(),
      vendedoresPDV(),
      listarAtivas(),
      listarVendas({ limite: 300 }),
    ]);

  const podeEditar = eu ? podeFazer(eu.papel, "produtos.editar") : false;

  const valorEstoque = produtos.reduce(
    (s, p) => s + (p.precoCusto ?? p.preco) * p.quantidade,
    0,
  );
  const totalItens = produtos.reduce((s, p) => s + p.quantidade, 0);
  const baixos = produtos.filter(
    (p) => p.quantidadeMinima > 0 && p.quantidade <= p.quantidadeMinima,
  );
  const maiorVenda = Math.max(1, ...vendidos.map((v) => v.total));

  return (
    <>
      <h1 className="kyron-display mb-fluid-lg text-fluid-xl text-kyron-white">
        Visão geral
      </h1>

      <div className="grid gap-fluid-sm sm:grid-cols-2 xl:grid-cols-4">
        <Cartao rotulo="Valor em estoque" valor={formatarPreco(valorEstoque)} />
        <Cartao rotulo="Produtos cadastrados" valor={String(produtos.length)} />
        <Cartao rotulo="Itens em estoque" valor={String(totalItens)} />
        <Cartao
          rotulo="Estoque baixo"
          valor={String(baixos.length)}
          alerta={baixos.length > 0}
          href="/erp/produtos?baixos=1"
        />
      </div>

      <PainelVendasDashboard
        vendedores={vendedores}
        maquininhas={maquininhas}
        vendas={vendas}
      />

      <Secao titulo={`Movimentação — últimos ${DIAS_GRAFICO} dias`}>
        <GraficoMovimentacao dados={serie} />
      </Secao>

      <div className="mt-fluid-xl grid gap-fluid-lg xl:grid-cols-2">
        <Secao titulo="Mais vendidos" semTopo>
          {vendidos.length === 0 ? (
            <Vazio>Nenhuma venda registrada ainda.</Vazio>
          ) : (
            <ul className="space-y-fluid-xs">
              {vendidos.map((v) => (
                <li key={v.produtoId}>
                  <div className="flex items-baseline justify-between gap-fluid-sm">
                    <ProdutoLink id={v.produtoId} nome={v.nome} podeEditar={podeEditar} />
                    <span className="shrink-0 text-fluid-2xs text-kyron-silver">
                      {v.total} un.
                    </span>
                  </div>
                  {/* Barra de magnitude: comprimento carrega o dado */}
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-kyron-black">
                    <div
                      className="h-full rounded-full bg-kyron-blue"
                      style={{ width: `${(v.total / maiorVenda) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Secao>

        <Secao titulo="Estoque baixo" semTopo>
          {baixos.length === 0 ? (
            <Vazio>Nenhum produto abaixo do mínimo.</Vazio>
          ) : (
            <ul className="space-y-fluid-2xs">
              {baixos.slice(0, 8).map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-fluid-sm rounded-kyron-sm border border-[var(--kyron-hairline)] px-fluid-sm py-fluid-xs"
                >
                  <ProdutoLink id={p.id} nome={p.nome} podeEditar={podeEditar} />
                  <span className="shrink-0 text-fluid-2xs text-kyron-blue">
                    {p.quantidade} / mín. {p.quantidadeMinima}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Secao>

        <Secao titulo="Últimas entradas" semTopo>
          <ListaFluxo itens={entradas} podeEditar={podeEditar} />
        </Secao>

        <Secao titulo="Últimas saídas" semTopo>
          <ListaFluxo itens={saidas} podeEditar={podeEditar} />
        </Secao>
      </div>

      <Secao titulo="Garantias a vencer (30 dias)">
        {garantias.length === 0 ? (
          <Vazio>
            Nenhuma garantia vencendo. O prazo é calculado a partir da venda
            registrada e da garantia do produto.
          </Vazio>
        ) : (
          <ul className="space-y-fluid-2xs">
            {garantias.map((g) => (
              <li
                key={g.id}
                className="flex flex-wrap items-center justify-between gap-fluid-sm rounded-kyron-sm border border-[var(--kyron-hairline)] px-fluid-sm py-fluid-xs"
              >
                <ProdutoLink id={g.produto.id} nome={g.produto.nome} podeEditar={podeEditar} />
                <span className="shrink-0 text-fluid-2xs text-kyron-silver">
                  vence em {dataCurta(g.vence)}
                  {g.documento ? ` · ${g.documento}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Secao>
    </>
  );
}

function ListaFluxo({
  itens,
  podeEditar,
}: {
  itens: {
    id: number;
    tipo: string;
    quantidade: number;
    criadoEm: Date;
    produto: { id: number; nome: string };
  }[];
  podeEditar: boolean;
}) {
  if (itens.length === 0) return <Vazio>Nada registrado ainda.</Vazio>;
  return (
    <ul className="space-y-fluid-2xs">
      {itens.map((m) => (
        <li
          key={m.id}
          className="flex flex-wrap items-center justify-between gap-fluid-sm rounded-kyron-sm border border-[var(--kyron-hairline)] px-fluid-sm py-fluid-xs"
        >
          <ProdutoLink id={m.produto.id} nome={m.produto.nome} podeEditar={podeEditar} />
          <span className="shrink-0 text-fluid-2xs text-kyron-silver">
            {rotuloTipo(m.tipo)} · {m.quantidade} un. · {dataCurta(m.criadoEm)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Secao({
  titulo,
  children,
  semTopo = false,
}: {
  titulo: string;
  children: React.ReactNode;
  semTopo?: boolean;
}) {
  return (
    <section className={semTopo ? "" : "mt-fluid-xl"}>
      <h2 className="kyron-label mb-fluid-sm text-fluid-2xs text-kyron-silver/70">
        {titulo}
      </h2>
      {children}
    </section>
  );
}

function Vazio({ children }: { children: React.ReactNode }) {
  return <p className="text-fluid-sm text-kyron-silver/60">{children}</p>;
}

function Cartao({
  rotulo,
  valor,
  alerta = false,
  href,
}: {
  rotulo: string;
  valor: string;
  alerta?: boolean;
  href?: string;
}) {
  const conteudo = (
    <>
      <p className="kyron-label text-fluid-2xs text-kyron-silver/60">{rotulo}</p>
      <p className="kyron-display mt-1 text-fluid-xl text-kyron-white">{valor}</p>
    </>
  );
  const classe = `block rounded-kyron-md border bg-kyron-graphite p-fluid-md transition-colors ${
    alerta ? "border-[var(--kyron-blue-line)]" : "border-[var(--kyron-hairline)]"
  } ${href ? "hover:border-[var(--kyron-blue-line)]" : ""}`;

  return href ? (
    <Link href={href} className={classe}>
      {conteudo}
    </Link>
  ) : (
    <div className={classe}>{conteudo}</div>
  );
}
