import {
  ArrowRight, Award, BarChart3, Bell, BookOpen, CheckCircle2, Clock3,
  Compass, Headphones, Home, LayoutDashboard, Library, LockKeyhole,
  LogOut, Play, Search, Sparkles, Target, TrendingUp, Trophy, Zap,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { acaoLogout } from "@/lib/auth/actions";
import { getPosts } from "@/lib/manual";
import { usuarioLogado } from "@/lib/usuario-auth";

export const dynamic = "force-dynamic";

type PostCard = {
  id: number;
  slug: string;
  titulo: string;
  resumo: string | null;
  restrito: boolean;
  youtubeId: string | null;
};

const trilhas = [
  { nivel: "N1", nome: "Vendedor Júnior", descricao: "Atendimento, abordagem, necessidade e fechamento.", modulos: 10, duracao: "7h 20min", cor: "blue" },
  { nivel: "N2", nome: "Vendedor Intermediário", descricao: "WhatsApp, objeções e perfil do cliente.", modulos: 3, duracao: "3h 40min", cor: "violet" },
  { nivel: "N3", nome: "Vendedor Hunter", descricao: "Prospecção, carteira, negociação e fechamento.", modulos: 4, duracao: "5h 10min", cor: "orange" },
];

export default async function AcademyPage() {
  const usuario = await usuarioLogado();
  if (!usuario) redirect("/app/login");
  if (!usuario.aprovado) return <Aguardando nome={usuario.nome} />;

  const posts = await getPosts();
  const treinamentos = posts.filter((post) => Boolean(post.youtubeId));
  const manuais = posts.filter((post) => !post.youtubeId);
  const destaque = treinamentos[0];
  const primeiroNome = usuario.nome.split(" ")[0] || usuario.nome;
  const sair = acaoLogout.bind(null, "/app/login");

  return (
    <div className="academy-app">
      <aside className="academy-sidebar">
        <Logo />
        <nav aria-label="Navegação da Academy">
          <span className="academy-nav-label">APRENDIZADO</span>
          <Link href="/app" className="active"><Home size={18} /> Início</Link>
          <Link href="/app#trilhas"><BookOpen size={18} /> Minhas trilhas</Link>
          <Link href="/app#novidades"><Sparkles size={18} /> Novidades <em>{posts.length}</em></Link>
          <Link href="/app#progresso"><BarChart3 size={18} /> Meu progresso</Link>
          <span className="academy-nav-label academy-nav-space">CONTEÚDO</span>
          <Link href="/app#biblioteca"><Library size={18} /> Biblioteca</Link>
          <Link href="/app#certificados"><Award size={18} /> Certificados</Link>
        </nav>
        <div className="academy-help"><span><Headphones size={19} /></span><div><b>Precisa de ajuda?</b><small>Fale com a equipe Kyron</small></div></div>
        <div className="academy-user"><span>{iniciais(usuario.nome)}</span><div><b>{usuario.nome}</b><small>Aluno aprovado</small></div><form action={sair}><button type="submit" aria-label="Sair"><LogOut size={17} /></button></form></div>
      </aside>

      <div className="academy-main">
        <header className="academy-topbar">
          <div className="academy-search"><Search size={17} /><span>Buscar trilhas, aulas ou materiais</span><kbd>⌘ K</kbd></div>
          <div className="academy-top-actions"><span className="academy-live"><i /> ACESSO ATIVO</span><button aria-label="Notificações"><Bell size={18} /><i /></button></div>
        </header>

        <main className="academy-content">
          <section className="academy-welcome">
            <div><p className="academy-eyebrow"><i /> SUA JORNADA KYRON</p><h1>Olá, {primeiroNome}. <span>Vamos evoluir?</span></h1><p>Conhecimento aplicado à rotina. Um passo por vez, com resultado visível.</p></div>
            <div className="academy-streak"><span><Zap size={19} /></span><div><b>Comece hoje</b><small>Construa sua sequência</small></div><div className="academy-week"><i>S</i><i>T</i><i>Q</i><i className="today">Q</i><i>S</i></div></div>
          </section>

          <ContinueCard post={destaque} />

          <section id="progresso" className="academy-stats" aria-label="Resumo do aprendizado">
            <Stat icon={<TrendingUp size={19} />} tone="blue" label="Trilhas disponíveis" value="3" detail="N1 a N3" />
            <Stat icon={<Play size={19} />} tone="violet" label="Aulas publicadas" value={String(treinamentos.length)} detail="Conteúdo em vídeo" />
            <Stat icon={<BookOpen size={19} />} tone="green" label="Materiais práticos" value={String(manuais.length)} detail="Guias para consultar" />
            <Stat icon={<Trophy size={19} />} tone="orange" label="Próxima conquista" value="N1" detail="Vendedor Júnior" />
          </section>

          <section id="trilhas" className="academy-section">
            <SectionTitle eyebrow="SEU CAMINHO" title="Trilhas de desenvolvimento" />
            <div className="academy-track-grid">
              {trilhas.map((trilha, index) => <TrackCard key={trilha.nivel} trilha={trilha} href={index === 0 && destaque ? `/app/treinamentos/${destaque.slug}` : null} />)}
            </div>
          </section>

          <section className="academy-lower-grid">
            <div id="novidades" className="academy-panel">
              <SectionTitle eyebrow="CONTEÚDO PUBLICADO" title="Novos na Academy" />
              <div className="academy-news-list">
                {posts.slice(0, 4).map((post) => <ContentRow key={post.id} post={post} />)}
                {!posts.length && <Empty label="Os primeiros conteúdos serão publicados em breve." />}
              </div>
            </div>
            <div id="certificados" className="academy-panel academy-goal">
              <p className="academy-eyebrow"><i /> PRÓXIMA CONQUISTA</p>
              <div className="academy-goal-ring"><span><b>N1</b><small>trilha inicial</small></span></div>
              <h2>Vendedor Júnior</h2>
              <p>Conclua as aulas e a avaliação final para emitir seu certificado.</p>
              <span className="academy-coming"><Award size={15} /> Certificação em preparação</span>
            </div>
          </section>

          <section id="biblioteca" className="academy-section academy-library">
            <div><p className="academy-eyebrow"><i /> BIBLIOTECA KYRON</p><h2>Conhecimento para consultar na hora certa.</h2><p>Manuais, exemplos e referências práticas reunidos em um só lugar.</p></div>
            <div className="academy-library-count"><Compass size={25} /><span><b>{manuais.length}</b><small>materiais publicados</small></span></div>
          </section>
        </main>
        <footer className="academy-footer"><Logo compact /><span>© 2026 Kyron Academy</span><span>Aprenda. Pratique. Evolua.</span></footer>
      </div>
    </div>
  );
}

function Logo({ compact = false }: { compact?: boolean }) {
  return <Link href="/app" className={`academy-logo ${compact ? "compact" : ""}`}><span>K</span>{!compact && <div><b>KYRON</b><small>ACADEMY</small></div>}</Link>;
}

function ContinueCard({ post }: { post?: PostCard }) {
  const href = post ? `/app/treinamentos/${post.slug}` : "/app#trilhas";
  return <section className="academy-continue"><div className="academy-continue-art"><span className="orbit one" /><span className="orbit two" /><span className="orbit three" /><span className="academy-target"><Target size={48} /></span><span className="academy-lesson-pill"><Play size={11} fill="currentColor" /> TRILHA 1 · PRIMEIROS PASSOS</span></div><div className="academy-continue-copy"><p className="academy-eyebrow blue"><i /> {post ? "COMECE POR AQUI" : "SUA JORNADA COMEÇA AQUI"}</p><h2>{post?.titulo ?? "O padrão de atendimento Kyron"}</h2><p>{post?.resumo ?? "A primeira trilha organiza os fundamentos para atender, entender e vender com confiança."}</p><div className="academy-meta"><span><Clock3 size={14} /> No seu ritmo</span><span><BookOpen size={14} /> Trilha N1</span></div><div className="academy-progress"><span><i /></span><small>Seu progresso começa na primeira aula</small></div><Link href={href} className="academy-primary"><Play size={16} fill="currentColor" /> {post ? "Começar aula" : "Conhecer a trilha"}<ArrowRight size={16} /></Link></div><span className="academy-track-number">01</span></section>;
}

function Stat({ icon, tone, label, value, detail }: { icon: React.ReactNode; tone: string; label: string; value: string; detail: string }) {
  return <article><span className={`academy-stat-icon ${tone}`}>{icon}</span><div><small>{label}</small><b>{value}</b><em>{detail}</em></div></article>;
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div className="academy-section-title"><div><p className="academy-eyebrow"><i /> {eyebrow}</p><h2>{title}</h2></div></div>;
}

function TrackCard({ trilha, href }: { trilha: typeof trilhas[number]; href: string | null }) {
  return <article className="academy-track"><div className={`academy-track-art ${trilha.cor}`}><span>{trilha.nivel}</span><i /><small>KYRON ACADEMY</small></div><div className="academy-track-body"><span className="academy-level">{trilha.nivel}</span><h3>{trilha.nome}</h3><p>{trilha.descricao}</p><div className="academy-track-meta"><span><LayoutDashboard size={13} /> {trilha.modulos} módulos</span><span><Clock3 size={13} /> {trilha.duracao}</span></div>{href ? <Link href={href} className="academy-secondary">Começar trilha <ArrowRight size={15} /></Link> : <span className="academy-locked"><LockKeyhole size={14} /> Em preparação</span>}</div></article>;
}

function ContentRow({ post }: { post: PostCard }) {
  const area = post.youtubeId ? "treinamentos" : "manuais";
  return <Link href={`/app/${area}/${post.slug}`} className="academy-news"><span className={post.youtubeId ? "video" : "manual"}>{post.youtubeId ? <Play size={20} /> : <BookOpen size={20} />}</span><div><em>{post.youtubeId ? "AULA EM VÍDEO" : "MATERIAL PRÁTICO"}</em><b>{post.titulo}</b><small>{post.resumo ?? "Conteúdo Kyron Academy"}</small></div><ArrowRight size={16} /></Link>;
}

function Empty({ label }: { label: string }) {
  return <div className="academy-empty"><Sparkles size={18} /><span>{label}</span></div>;
}

function Aguardando({ nome }: { nome: string }) {
  const sair = acaoLogout.bind(null, "/app/login");
  return <main className="academy-pending"><Logo /><div><span className="academy-pending-icon"><CheckCircle2 size={28} /></span><p className="academy-eyebrow blue"><i /> CADASTRO RECEBIDO</p><h1>Sua conta está em análise.</h1><p>Olá, {nome}. A equipe Kyron vai validar seu vínculo e liberar as trilhas adequadas ao seu perfil.</p><div className="academy-pending-steps"><span className="done"><i>1</i> Conta criada</span><span className="active"><i>2</i> Aprovação Kyron</span><span><i>3</i> Trilhas liberadas</span></div><form action={sair}><button type="submit" className="academy-secondary"><LogOut size={15} /> Sair</button></form></div></main>;
}

function iniciais(nome: string): string {
  return nome.split(" ").filter(Boolean).slice(0, 2).map((parte) => parte[0]).join("").toUpperCase();
}
