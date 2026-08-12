import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { VoltarLink } from "@/components/academy/VoltarLink";
import { getPost } from "@/lib/manual";
import { guardaAcademy } from "@/lib/auth/areas";

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

  await guardaAcademy(); // aprovado já garantido pelo layout (painel)

  const post = await getPost(slug);
  if (!post) notFound();
  const ehTreinamento = Boolean(post.youtubeId);
  if ((area === "treinamentos") !== ehTreinamento) notFound();

  return (
    <div style={{ maxWidth: 760 }}>
      <VoltarLink href="/app" label="Início" />

      <p className="academy-eyebrow blue"><i /> {ehTreinamento ? "TREINAMENTO EM VÍDEO" : "MANUAL PRÁTICO"}</p>
      <h1 style={{ margin: "10px 0 8px", color: "var(--academy-text)", fontSize: "clamp(1.4rem,2.4vw,1.9rem)", letterSpacing: "-.03em" }}>
        {post.titulo}
      </h1>
      {post.resumo && <p style={{ color: "var(--academy-muted)", fontSize: 13, marginBottom: 20 }}>{post.resumo}</p>}

      {post.youtubeId && (
        <div style={{ position: "relative", aspectRatio: "16/9", borderRadius: 12, overflow: "hidden", background: "#000" }}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${post.youtubeId}`}
            title={post.titulo}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
          />
        </div>
      )}
      {post.conteudo && (
        <div style={{ marginTop: 18, color: "var(--academy-muted)", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
          {post.conteudo}
        </div>
      )}
    </div>
  );
}
