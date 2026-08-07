import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getPost } from "@/lib/manual";
import { usuarioLogado } from "@/lib/usuario-auth";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ area: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  return post ? { title: post.titulo, robots: { index: false, follow: false } } : {};
}

export default async function ConteudoPage({ params }: Props) {
  const { area, slug } = await params;
  if (area !== "treinamentos" && area !== "manuais") notFound();

  const usuario = await usuarioLogado();
  if (!usuario) redirect("/app/login");
  if (!usuario.aprovado) return <Aguardando />;

  const post = await getPost(slug);
  if (!post) notFound();
  const ehTreinamento = Boolean(post.youtubeId);
  if ((area === "treinamentos") !== ehTreinamento) notFound();

  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--kyron-hairline)] bg-kyron-black/85 backdrop-blur">
        <div className="container-kyron flex min-h-16 items-center justify-between">
          <Link href="/app" className="kyron-label text-fluid-xs tracking-[0.14em] text-kyron-blue">KYRON ACADEMY</Link>
          <Link href="/app" className="text-fluid-2xs text-kyron-silver/70 hover:text-kyron-white">← Todos os conteúdos</Link>
        </div>
      </header>
      <div className="container-kyron py-fluid-xl">
        <div className="mx-auto max-w-[58rem]">
          <p className="kyron-label text-fluid-2xs tracking-[0.16em] text-kyron-blue">{ehTreinamento ? "TREINAMENTO EM VÍDEO" : "MANUAL PRÁTICO"}</p>
          <h1 className="kyron-display mt-fluid-xs max-w-[24ch] text-fluid-2xl leading-[1.05] text-kyron-white">{post.titulo}</h1>
          {post.resumo && <p className="mt-fluid-sm max-w-[62ch] text-fluid-base leading-relaxed text-kyron-silver">{post.resumo}</p>}
          {post.youtubeId && (
            <div className="relative mt-fluid-lg aspect-video w-full overflow-hidden rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-black">
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
          {post.conteudo && <div className="mt-fluid-lg whitespace-pre-wrap text-fluid-base leading-relaxed text-kyron-silver">{post.conteudo}</div>}
        </div>
      </div>
    </main>
  );
}

function Aguardando() {
  return (
    <main className="flex min-h-screen items-center justify-center px-fluid-md py-fluid-xl">
      <div className="max-w-[34rem] rounded-kyron-lg border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-lg text-center">
        <h1 className="kyron-display text-fluid-xl text-kyron-white">Acesso em análise.</h1>
        <p className="mt-fluid-sm text-fluid-base text-kyron-silver">Seu cadastro ainda aguarda aprovação da Kyron.</p>
        <Link href="/app" className="mt-fluid-lg inline-flex text-fluid-xs text-kyron-blue hover:underline">Voltar</Link>
      </div>
    </main>
  );
}
