import Link from "next/link";

import { AcoesPost } from "@/components/admin/AcoesPost";
import { PostForm } from "@/components/admin/PostForm";
import { getPostsAdmin } from "@/lib/manual";

export const dynamic = "force-dynamic";

export default async function AdminManual({
  searchParams,
}: {
  searchParams: Promise<{ editar?: string }>;
}) {
  const { editar } = await searchParams;
  const editarId = editar ? Number(editar) : null;

  const posts = await getPostsAdmin();
  const emEdicao = editarId ? posts.find((p) => p.id === editarId) : undefined;

  return (
    <div className="grid gap-fluid-xl [grid-template-columns:repeat(auto-fit,minmax(min(100%,22rem),1fr))]">
      <div>
        <h1 className="kyron-display mb-fluid-md text-fluid-xl text-kyron-white">
          Manual · posts e aulas
        </h1>
        {posts.length === 0 ? (
          <p className="text-fluid-sm text-kyron-silver">
            Nada publicado ainda. Crie o primeiro no formulário ao lado.
          </p>
        ) : (
          <ul className="space-y-fluid-xs">
            {posts.map((p) => (
              <li
                key={p.id}
                className={`rounded-kyron-md border p-fluid-sm ${
                  p.id === editarId
                    ? "border-[var(--kyron-blue-line)]"
                    : "border-[var(--kyron-hairline)]"
                } ${p.publicado ? "" : "opacity-55"}`}
              >
                <div className="flex items-start justify-between gap-fluid-sm">
                  <div className="min-w-0">
                    <p className="truncate text-fluid-sm font-semibold text-kyron-white">
                      {p.titulo}
                    </p>
                    <p className="text-fluid-2xs text-kyron-silver/60">
                      {p.youtubeId ? "Aula em vídeo" : "Post"}
                      {p.restrito && " · restrito"}
                      {!p.publicado && " · rascunho"}
                    </p>
                  </div>
                  <Link
                    href={`/admin/manual?editar=${p.id}`}
                    className="shrink-0 text-fluid-2xs text-kyron-blue hover:underline"
                  >
                    Editar
                  </Link>
                </div>
                <div className="mt-fluid-xs">
                  <AcoesPost id={p.id} publicado={p.publicado} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <div className="mb-fluid-md flex items-center justify-between">
          <h2 className="kyron-display text-fluid-base text-kyron-white">
            {emEdicao ? "Editar" : "Novo post / aula"}
          </h2>
          {emEdicao && (
            <Link
              href="/admin/manual"
              className="text-fluid-2xs text-kyron-silver/60 hover:text-kyron-silver"
            >
              + Novo
            </Link>
          )}
        </div>
        <PostForm
          key={emEdicao?.id ?? "novo"}
          post={
            emEdicao
              ? {
                  id: emEdicao.id,
                  titulo: emEdicao.titulo,
                  resumo: emEdicao.resumo,
                  conteudo: emEdicao.conteudo,
                  youtubeId: emEdicao.youtubeId,
                  restrito: emEdicao.restrito,
                  publicado: emEdicao.publicado,
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}
