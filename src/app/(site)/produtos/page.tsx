import type { Metadata } from "next";

import { CategoriaFiltro } from "@/components/catalogo/CategoriaFiltro";
import { ProdutoCard } from "@/components/catalogo/ProdutoCard";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { getCategoriasArvore, getProdutos } from "@/lib/catalogo";

export const metadata: Metadata = {
  title: "Produtos — Apple, Casa Inteligente e Áudio",
  description:
    "Apple novos e seminovos, casa inteligente, áudio e acessórios em Santa Cruz do Sul. Fale no WhatsApp e garanta o seu.",
  alternates: { canonical: "/produtos" },
};

// Catálogo muda com frequência; recarrega a cada 5 min sem rebuild.
export const revalidate = 300;

export default async function Produtos({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;
  const [arvore, { categoria: catAtiva, produtos }] = await Promise.all([
    getCategoriasArvore(),
    getProdutos(categoria),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Catálogo"
        titulo={
          catAtiva ? (
            catAtiva.nome
          ) : (
            <>
              Tecnologia que você leva{" "}
              <span className="text-kyron-blue">hoje</span>.
            </>
          )
        }
        lede={
          catAtiva
            ? undefined
            : "Apple novos e seminovos, casa inteligente, áudio e acessórios. Escolha o seu e fale com a gente no WhatsApp."
        }
      >
        <div className="mt-fluid-lg">
          <CategoriaFiltro categorias={arvore} ativa={categoria} />
        </div>
      </PageHero>

      <Section semBorda>
        {produtos.length === 0 ? (
          <p className="mx-auto max-w-[48ch] text-center text-fluid-base text-kyron-silver">
            Nenhum produto nesta categoria por enquanto. Fale no WhatsApp que a
            gente te ajuda a encontrar.
          </p>
        ) : (
          <ul className="grid-fluida-4">
            {produtos.map((p, i) => (
              <li key={p.id}>
                <ProdutoCard produto={p} prioridade={i < 4} />
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
