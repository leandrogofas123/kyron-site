import Link from "next/link";

import { AcoesAula } from "@/components/erp/AcoesAula";
import { AulaForm } from "@/components/erp/AulaForm";
import { colaboradorLogado, podeFazer } from "@/lib/erp/auth";
import { getPostsAdmin } from "@/lib/manual";

export const dynamic = "force-dynamic";

export default async function ErpAulas({
  searchParams,
}: {
  searchParams: Promise<{ editar?: string }>;
}) {
  const eu = await colaboradorLogado();
  if (!eu || !podeFazer(eu.papel, "aulas")) {
    return (
      <div className="mx-auto max-w-[40rem] rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-lg text-center">
        <h1 className="kyron-display text-fluid-lg text-kyron-white">Acesso restrito</h1>
        <p className="mt-fluid-sm text-fluid-base text-kyron-silver">
          A gestão do Manual e das aulas é para administradores e gerentes.
        </p>
      </div>
    );
  }

  const { editar } = await searchParams;
  const editarId = editar ? Number(editar) : null;
  const posts = await getPostsAdmin();
  const emEdicao = editarId ? posts.find((p) => p.id === editarId) : undefined;

  return (
    <>
      <div className="mb-fluid-lg">
        <h1 className="kyron-display text-fluid-xl text-kyron-white">Aulas & Manual</h1>
        <p className="text-fluid-2xs text-kyron-silver/60">
          Publique aulas em vídeo e posts do Manual de Instalação. Aula restrita só
          aparece para alunos aprovados. Publicar reflete em /manual na hora.
        </p>
      </div>

      <div className="grid gap-fluid-xl xl:grid-cols-[minmax(0,1fr)_24rem] xl:items-start">
        {/* lista */}
        <div>
          <h2 className="kyron-label mb-fluid-sm text-fluid-2xs text-kyron-silver/70">
            Conteúdo ({posts.length})
          </h2>
          {posts.length === 0 ? (
            <p className="text-fluid-2xs text-kyron-silver/60">
              Nada publicado ainda. Crie o primeiro no formulário ao lado.
            </p>
          ) : (
            <ul className="space-y-fluid-2xs">
              {posts.map((p) => (
                <li
                  key={p.id}
                  className={`rounded-kyron-md border p-fluid-sm ${
                    p.id === editarId ? "border-[var(--kyron-blue-line)]" : "border-[var(--kyron-hairline)]"
                  } ${p.publicado ? "" : "opacity-55"}`}
                >
                  <div className="flex items-start justify-between gap-fluid-sm">
                    <div className="min-w-0">
                      <p className="truncate text-fluid-sm font-semibold text-kyron-white">{p.titulo}</p>
                      <p className="text-fluid-2xs text-kyron-silver/60">
                        {p.youtubeId ? "Aula em vídeo" : "Post"}
                        {p.restrito && " · restrito"}
                        {!p.publicado && " · rascunho"}
                      </p>
                    </div>
                    <Link href={`/erp/aulas?editar=${p.id}`} className="shrink-0 text-fluid-2xs text-kyron-blue hover:underline">
                      Editar
                    </Link>
                  </div>
                  <div className="mt-fluid-xs">
                    <AcoesAula id={p.id} publicado={p.publicado} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* form */}
        <div className="rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-md">
          <div className="mb-fluid-md flex items-center justify-between">
            <h2 className="kyron-display text-fluid-base text-kyron-white">
              {emEdicao ? "Editar" : "Nova aula / post"}
            </h2>
            {emEdicao && (
              <Link href="/erp/aulas" className="text-fluid-2xs text-kyron-silver/60 hover:text-kyron-silver">
                + Novo
              </Link>
            )}
          </div>
          <AulaForm
            key={emEdicao?.id ?? "novo"}
            aula={
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
    </>
  );
}
