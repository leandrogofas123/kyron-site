import Link from "next/link";
import { redirect } from "next/navigation";

import { acaoLogout } from "@/lib/auth/actions";
import { getPosts } from "@/lib/manual";
import { usuarioLogado } from "@/lib/usuario-auth";

export const dynamic = "force-dynamic";

export default async function AcademyPage() {
  const usuario = await usuarioLogado();
  if (!usuario) redirect("/login");

  if (!usuario.aprovado) {
    return <Aguardando nome={usuario.nome} />;
  }

  const posts = await getPosts();
  const treinamentos = posts.filter((post) => Boolean(post.youtubeId));
  const manuais = posts.filter((post) => !post.youtubeId);
  const sair = acaoLogout.bind(null, "/");

  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--kyron-hairline)] bg-kyron-black/85 backdrop-blur">
        <div className="container-kyron flex min-h-16 items-center justify-between gap-fluid-sm">
          <Link href="/" className="kyron-label text-fluid-xs tracking-[0.14em] text-kyron-blue">
            KYRON ACADEMY
          </Link>
          <div className="flex items-center gap-fluid-sm">
            <span className="hidden text-fluid-xs text-kyron-silver sm:block">Olá, {usuario.nome}</span>
            <form action={sair}>
              <button type="submit" className="text-fluid-2xs text-kyron-silver/70 hover:text-kyron-white">
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="container-kyron py-fluid-xl">
        <section className="relative overflow-hidden rounded-kyron-lg border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-lg sm:p-fluid-xl">
          <div aria-hidden className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-kyron-blue/15 blur-3xl" />
          <div className="relative max-w-[48rem]">
            <p className="kyron-label text-fluid-2xs tracking-[0.18em] text-kyron-blue">CENTRAL DE APRENDIZAGEM</p>
            <h1 className="kyron-display mt-fluid-xs text-fluid-2xl leading-[1.05] text-kyron-white">
              Aprenda no seu ritmo.
            </h1>
            <p className="mt-fluid-sm max-w-[58ch] text-fluid-base leading-relaxed text-kyron-silver">
              Treinamentos em vídeo e manuais práticos para instalar, configurar e tirar mais proveito das soluções Kyron.
            </p>
            <div className="mt-fluid-lg flex flex-wrap gap-fluid-xs text-fluid-2xs text-kyron-silver/70">
              <span className="rounded-full border border-[var(--kyron-hairline-strong)] px-fluid-sm py-1.5">{treinamentos.length} treinamentos</span>
              <span className="rounded-full border border-[var(--kyron-hairline-strong)] px-fluid-sm py-1.5">{manuais.length} manuais</span>
              <span className="rounded-full border border-[var(--kyron-hairline-strong)] px-fluid-sm py-1.5">Acesso aprovado</span>
            </div>
          </div>
        </section>

        <section className="mt-fluid-xl">
          <div className="flex items-end justify-between gap-fluid-sm">
            <div>
              <p className="kyron-label text-fluid-2xs tracking-[0.14em] text-kyron-blue">TREINAMENTOS</p>
              <h2 className="kyron-display mt-fluid-xs text-fluid-xl text-kyron-white">Aulas para fazer acontecer.</h2>
            </div>
            <span className="hidden text-fluid-2xs text-kyron-silver/60 sm:block">Vídeo passo a passo</span>
          </div>
          {treinamentos.length ? (
            <ul className="mt-fluid-md grid gap-fluid-sm md:grid-cols-2">
              {treinamentos.map((post) => <Card key={post.id} post={post} tipo="treinamento" />)}
            </ul>
          ) : (
            <Empty label="Os primeiros treinamentos serão publicados em breve." />
          )}
        </section>

        <section className="mt-fluid-xl border-t border-[var(--kyron-hairline)] pt-fluid-xl">
          <p className="kyron-label text-fluid-2xs tracking-[0.14em] text-kyron-blue">MANUAIS E GUIAS</p>
          <h2 className="kyron-display mt-fluid-xs text-fluid-xl text-kyron-white">Referências para consultar quando precisar.</h2>
          {manuais.length ? (
            <ul className="mt-fluid-md grid gap-fluid-sm md:grid-cols-2">
              {manuais.map((post) => <Card key={post.id} post={post} tipo="manual" />)}
            </ul>
          ) : (
            <Empty label="Ainda não há manuais publicados." />
          )}
        </section>
      </div>
    </main>
  );
}

function Card({ post, tipo }: { post: { id: number; slug: string; titulo: string; resumo: string | null; restrito: boolean; youtubeId: string | null }; tipo: "treinamento" | "manual" }) {
  return (
    <li>
      <Link href={`/${tipo === "treinamento" ? "treinamentos" : "manuais"}/${post.slug}`} className="group flex h-full flex-col rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--kyron-blue-line)]">
        <div className="flex items-center justify-between gap-fluid-sm">
          <span className="kyron-label text-fluid-2xs text-kyron-blue">{tipo === "treinamento" ? "TREINAMENTO EM VÍDEO" : "MANUAL PRÁTICO"}</span>
          {post.restrito && <span className="text-fluid-2xs text-kyron-silver/60">Exclusivo</span>}
        </div>
        <h3 className="kyron-display mt-fluid-sm text-fluid-base text-kyron-white">{post.titulo}</h3>
        {post.resumo && <p className="mt-fluid-2xs line-clamp-3 text-fluid-sm leading-relaxed text-kyron-silver">{post.resumo}</p>}
        <span className="kyron-label mt-auto pt-fluid-md text-fluid-xs text-kyron-blue group-hover:underline">{tipo === "treinamento" ? "Começar treinamento →" : "Abrir manual →"}</span>
      </Link>
    </li>
  );
}

function Empty({ label }: { label: string }) {
  return <p className="mt-fluid-md rounded-kyron-md border border-dashed border-[var(--kyron-hairline-strong)] px-fluid-md py-fluid-lg text-center text-fluid-sm text-kyron-silver/70">{label}</p>;
}

function Aguardando({ nome }: { nome: string }) {
  const sair = acaoLogout.bind(null, "/");
  return (
    <main className="flex min-h-screen items-center justify-center px-fluid-md py-fluid-xl">
      <div className="w-full max-w-[34rem] rounded-kyron-lg border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-lg text-center">
        <p className="kyron-label text-fluid-2xs tracking-[0.16em] text-kyron-blue">KYRON ACADEMY</p>
        <h1 className="kyron-display mt-fluid-sm text-fluid-xl text-kyron-white">Cadastro em análise.</h1>
        <p className="mt-fluid-sm text-fluid-base leading-relaxed text-kyron-silver">
          Olá, {nome}. Sua conta foi criada e aguarda a aprovação da Kyron. Assim que o acesso for liberado, os treinamentos aparecerão aqui.
        </p>
        <div className="mt-fluid-lg flex justify-center">
          <form action={sair}><button type="submit" className="kyron-label rounded-kyron-sm border border-[var(--kyron-hairline-strong)] px-fluid-md py-fluid-sm text-fluid-xs text-kyron-silver hover:text-kyron-white">Sair</button></form>
        </div>
      </div>
    </main>
  );
}
