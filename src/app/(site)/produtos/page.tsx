import type { Metadata } from "next";

import { CatalogoControles } from "@/components/catalogo/CatalogoControles";
import { CategoriaFiltro } from "@/components/catalogo/CategoriaFiltro";
import { ProdutoCard } from "@/components/catalogo/ProdutoCard";
import {
  getCategoriasArvore,
  getProdutos,
  type OrdenarProdutos,
} from "@/lib/catalogo";

export const metadata: Metadata = {
  title: "Produtos — Apple, Casa Inteligente e Áudio",
  description:
    "Apple novos e seminovos, casa inteligente, áudio e acessórios em Santa Cruz do Sul. Fale no WhatsApp e garanta o seu.",
  alternates: { canonical: "/produtos" },
};

// Lê o banco e reage a busca/ordenação por query — renderiza a cada acesso.
export const dynamic = "force-dynamic";

export default async function Produtos({
  searchParams,
}: {
  searchParams: Promise<{
    categoria?: string;
    q?: string;
    ordenar?: OrdenarProdutos;
  }>;
}) {
  const { categoria, q, ordenar } = await searchParams;
  const [arvore, { categoria: catAtiva, produtos }] = await Promise.all([
    getCategoriasArvore(),
    getProdutos({ categoria, q, ordenar }),
  ]);
  const buscando = Boolean(q?.trim());

  return (
    <div className="container-kyron pb-fluid-xl pt-fluid-md">
      {/* Cabeçalho compacto — produtos aparecem logo abaixo */}
      <div className="mb-fluid-sm">
        <p className="kyron-label text-fluid-2xs tracking-[0.16em] text-kyron-silver/55">
          Catálogo
        </p>
        <h1 className="kyron-display text-fluid-xl text-kyron-white">
          {catAtiva ? catAtiva.nome : "Todos os produtos"}
        </h1>
      </div>

      {/* Toolbar enxuta e larga: categorias + busca/ordenação */}
      <div className="kyron-scroll mb-fluid-xs overflow-x-auto pb-1">
        <CategoriaFiltro categorias={arvore} ativa={categoria} />
      </div>
      <div className="mb-fluid-md">
        <CatalogoControles total={produtos.length} />
      </div>

      {produtos.length === 0 ? (
        <p className="max-w-[52ch] text-fluid-base text-kyron-silver">
          {buscando
            ? "Nada encontrado para a sua busca. Tente outro termo ou fale no WhatsApp que a gente encontra para você."
            : "Nenhum produto nesta categoria por enquanto. Fale no WhatsApp que a gente te ajuda a encontrar."}
        </p>
      ) : (
        <ul className="grid-fluida-6">
          {produtos.map((p, i) => (
            <li key={p.id}>
              <ProdutoCard produto={p} prioridade={i < 6} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
