import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { getPost } from "@/lib/manual";
import { usuarioLogado } from "@/lib/usuario-auth";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.titulo,
    description: post.resumo ?? undefined,
    alternates: { canonical: `/manual/${post.slug}` },
    // Conteúdo restrito não deve ser indexado.
    robots: post.restrito ? { index: false, follow: false } : undefined,
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const ehAula = Boolean(post.youtubeId);

  // Controle de acesso das aulas restritas.
  if (post.restrito) {
    const usuario = await usuarioLogado();
    if (!usuario) return <Gate estado="deslogado" titulo={post.titulo} />;
    if (!usuario.aprovado)
      return <Gate estado="pendente" titulo={post.titulo} nome={usuario.nome} />;
  }

  return (
    <>
      <PageHero
        eyebrow={ehAula ? "Aula em vídeo" : "Novidade"}
        titulo={post.titulo}
        lede={post.resumo ?? undefined}
      />

      <Section semBorda>
        <div className="mx-auto max-w-[52rem]">
          {post.youtubeId && (
            <div className="relative aspect-video w-full overflow-hidden rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${post.youtubeId}`}
                title={post.titulo}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          )}

          {post.conteudo && (
            <div className="mt-fluid-lg whitespace-pre-wrap text-fluid-base leading-relaxed text-kyron-silver">
              {post.conteudo}
            </div>
          )}

          <div className="mt-fluid-xl">
            <Link
              href="/manual"
              className="kyron-label text-fluid-xs text-kyron-blue hover:underline"
            >
              ← Voltar ao Manual
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}

function Gate({
  estado,
  titulo,
  nome,
}: {
  estado: "deslogado" | "pendente";
  titulo: string;
  nome?: string;
}) {
  return (
    <>
      <PageHero eyebrow="Aula exclusiva" titulo={titulo} />
      <Section semBorda>
        <div className="mx-auto max-w-[40rem] rounded-kyron-lg border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-lg text-center">
          {estado === "pendente" ? (
            <>
              <h2 className="kyron-display text-fluid-lg text-kyron-white">
                Cadastro em análise
              </h2>
              <p className="mx-auto mt-fluid-sm max-w-[44ch] text-fluid-base text-kyron-silver">
                Olá{nome ? `, ${nome}` : ""}! Sua conta já foi criada e está
                aguardando aprovação da Kyron. Assim que liberarmos, esta aula
                fica disponível para você.
              </p>
              <div className="mt-fluid-lg">
                <Link
                  href="/manual"
                  className="kyron-label rounded-kyron-sm border border-[var(--kyron-hairline-strong)] px-fluid-md py-fluid-sm text-fluid-xs text-kyron-silver transition-colors duration-300 hover:border-[var(--kyron-blue-line)] hover:text-kyron-white"
                >
                  Voltar ao Manual
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="kyron-display text-fluid-lg text-kyron-white">
                Conteúdo exclusivo para clientes
              </h2>
              <p className="mx-auto mt-fluid-sm max-w-[44ch] text-fluid-base text-kyron-silver">
                Entre com sua conta ou cadastre-se para assistir. O acesso é
                liberado após aprovação da Kyron.
              </p>
              <div className="mt-fluid-lg flex flex-wrap justify-center gap-fluid-xs">
                <Link
                  href="/entrar"
                  className="kyron-label rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-sm text-fluid-xs text-white transition-all duration-300 hover:-translate-y-px"
                >
                  Entrar
                </Link>
                <Link
                  href="/criar-conta"
                  className="kyron-label rounded-kyron-sm border border-[var(--kyron-hairline-strong)] px-fluid-md py-fluid-sm text-fluid-xs text-kyron-silver transition-colors duration-300 hover:border-[var(--kyron-blue-line)] hover:text-kyron-white"
                >
                  Criar conta
                </Link>
              </div>
            </>
          )}
        </div>
      </Section>
    </>
  );
}
