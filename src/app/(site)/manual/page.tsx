import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { getPosts } from "@/lib/manual";
import { acaoSairUsuario } from "@/lib/usuario-actions";
import { usuarioLogado } from "@/lib/usuario-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manual de Instalação",
  description:
    "Tutoriais, novidades e aulas em vídeo de instalação e configuração de automação residencial e produtos Apple.",
  alternates: { canonical: "/manual" },
};

export default async function ManualPage() {
  const [posts, usuario] = await Promise.all([getPosts(), usuarioLogado()]);
  const liberado = Boolean(usuario?.aprovado);
  const aulas = posts.filter((p) => p.youtubeId).length;
  const artigos = posts.length - aulas;

  return (
    <>
      <PageHero
        eyebrow="Manual de Instalação"
        titulo={
          <>
            Aprenda a instalar e{" "}
            <span className="text-kyron-blue">configurar</span>.
          </>
        }
        lede="Tutoriais passo a passo, novidades e aulas em vídeo de instalação e configuração — de automação residencial a produtos Apple. Artigos abertos a todos; as aulas em vídeo são exclusivas para clientes com acesso aprovado."
      >
        <ul className="mt-fluid-md flex flex-wrap items-center justify-center gap-x-fluid-md gap-y-fluid-2xs text-fluid-2xs text-kyron-silver/80">
          {[
            aulas > 0 ? `${aulas} ${aulas === 1 ? "aula em vídeo" : "aulas em vídeo"}` : "Aulas em vídeo",
            artigos > 0 ? `${artigos} ${artigos === 1 ? "artigo" : "artigos"}` : "Artigos e novidades",
            "Passo a passo",
            "Atualizado sempre",
          ].map((t) => (
            <li key={t} className="inline-flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="text-kyron-blue">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              {t}
            </li>
          ))}
        </ul>
        <div className="mt-fluid-md">
          <BarraConta usuario={usuario} liberado={liberado} />
        </div>
      </PageHero>

      <Section semBorda>
        {posts.length === 0 ? (
          <p className="mx-auto max-w-[48ch] text-center text-fluid-base text-kyron-silver">
            Em breve publicaremos os primeiros conteúdos aqui.
          </p>
        ) : (
          <ul className="grid-fluida-2">
            {posts.map((post) => {
              const ehAula = Boolean(post.youtubeId);
              const bloqueado = post.restrito && !liberado;

              const interior = (
                <>
                  <div className="flex items-center justify-between gap-fluid-sm">
                    <span className="kyron-label rounded-full border border-[var(--kyron-hairline-strong)] px-fluid-xs py-1 text-fluid-2xs text-kyron-silver">
                      {ehAula ? "Aula em vídeo" : "Novidade"}
                    </span>
                    {post.restrito && <Cadeado aberto={liberado} />}
                  </div>

                  <h2 className="kyron-display mt-fluid-sm text-fluid-base text-kyron-white">
                    {post.titulo}
                  </h2>
                  {post.resumo && (
                    <p className="mt-fluid-2xs line-clamp-3 text-fluid-sm text-kyron-silver">
                      {post.resumo}
                    </p>
                  )}

                  <span className="kyron-label mt-auto pt-fluid-md inline-flex items-center gap-1.5 text-fluid-xs text-kyron-blue">
                    {bloqueado
                      ? usuario
                        ? "Acesso em análise"
                        : "Entre para assistir"
                      : ehAula
                        ? "Assistir aula"
                        : "Ler"}
                    {!bloqueado && (
                      <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    )}
                  </span>
                </>
              );

              const classe =
                "group flex h-full flex-col rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-md transition-all duration-[400ms] ease-in-out";

              return (
                <li key={post.id}>
                  {bloqueado ? (
                    <div className={`${classe} opacity-80`}>{interior}</div>
                  ) : (
                    <Link
                      href={`/manual/${post.slug}`}
                      className={`${classe} hover:-translate-y-0.5 hover:border-[var(--kyron-blue-line)]`}
                    >
                      {interior}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Section>
    </>
  );
}

function BarraConta({
  usuario,
  liberado,
}: {
  usuario: { nome: string } | null;
  liberado: boolean;
}) {
  if (!usuario) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-fluid-xs">
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
    );
  }

  return (
    <div className="mx-auto flex max-w-[36rem] flex-wrap items-center justify-center gap-fluid-sm rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite px-fluid-md py-fluid-sm">
      <p className="text-fluid-sm text-kyron-silver">
        Olá, <span className="text-kyron-white">{usuario.nome}</span> ·{" "}
        {liberado ? (
          <span className="text-kyron-blue">acesso liberado</span>
        ) : (
          "cadastro em análise — avisaremos quando liberar"
        )}
      </p>
      <form action={acaoSairUsuario}>
        <button
          type="submit"
          className="kyron-label text-fluid-2xs text-kyron-silver/70 transition-colors hover:text-kyron-white"
        >
          Sair
        </button>
      </form>
    </div>
  );
}

function Cadeado({ aberto }: { aberto: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={aberto ? "text-kyron-blue" : "text-kyron-silver/60"}
    >
      <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d={aberto ? "M8 10V7a4 4 0 0 1 7-2.6" : "M8 10V7a4 4 0 0 1 8 0v3"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
