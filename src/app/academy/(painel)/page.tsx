import {
  ArrowRight, Award, BookOpen, Clock3, Compass, LayoutDashboard, LockKeyhole,
  Play, Sparkles, Target, TrendingUp, Trophy,
} from "lucide-react";
import Link from "next/link";

import { getMateriaisAluno, getNovidadesAluno, getPerfilAluno, getTrilhasAluno, type NovidadeAluno } from "@/lib/academy/aluno-dados";
import { guardaAcademy } from "@/lib/auth/areas";
import { getPosts } from "@/lib/manual";

export const dynamic = "force-dynamic";

type TrilhaCard = Awaited<ReturnType<typeof getTrilhasAluno>>[number];

export default async function AcademyPage() {
  const usuario = await guardaAcademy(); // aprovado já garantido pelo layout (painel)

  const [posts, trilhas, materiais, novidades, perfil] = await Promise.all([
    getPosts(), getTrilhasAluno(usuario.id), getMateriaisAluno(), getNovidadesAluno(4), getPerfilAluno(usuario.id),
  ]);
  const treinamentos = posts.filter((post) => Boolean(post.youtubeId));
  const primeiroNome = usuario.nome.split(" ")[0] || usuario.nome;
  // Próxima trilha a concluir: a primeira não-100%, ou a primeira de todas se já concluiu tudo.
  const proximaTrilha = trilhas.find((t) => t.percentual < 100) ?? trilhas[0];
  // Próxima aula pendente em toda a Academy: prioriza trilha já iniciada, depois a primeira ainda não começada.
  const emAndamento = trilhas.find((t) => t.percentual > 0 && t.percentual < 100 && t.proximaAulaSlug);
  const naoComecada = trilhas.find((t) => t.percentual === 0 && t.proximaAulaSlug);
  const proximaAulaGlobal = emAndamento ?? naoComecada ?? null;

  return (
    <>
      <section className="academy-welcome">
        <div><p className="academy-eyebrow"><i /> SUA JORNADA KYRON</p><h1>Olá, {primeiroNome}. <span>Vamos evoluir?</span></h1><p>Conhecimento aplicado à rotina. Um passo por vez, com resultado visível.</p></div>
        <Link href="/academy/progresso" className="academy-streak" title="Ver meu progresso completo">
          <span><TrendingUp size={19} /></span>
          <div>
            <b>{perfil.streakDias > 0 ? `${perfil.streakDias} dia${perfil.streakDias > 1 ? "s" : ""} seguidos` : "Comece hoje"}</b>
            <small>{perfil.streakDias > 0 ? "Continue firme" : "Construa sua sequência"}</small>
          </div>
          <div className="academy-xp-pill"><b>{perfil.xpTotal} XP</b><small>{perfil.nivel}</small></div>
        </Link>
      </section>

      <ContinueCard alvo={proximaAulaGlobal} />

      <section className="academy-stats" aria-label="Resumo do aprendizado">
        <Stat icon={<TrendingUp size={19} />} tone="blue" label="Trilhas disponíveis" value={String(trilhas.length)} detail="N1 a N6" />
        <Stat icon={<Play size={19} />} tone="violet" label="Aulas publicadas" value={String(treinamentos.length)} detail="Conteúdo em vídeo" />
        <Stat icon={<BookOpen size={19} />} tone="green" label="Materiais práticos" value={String(materiais.length)} detail="Guias para consultar" />
        <Stat
          icon={<Trophy size={19} />} tone="orange" label="Próxima trilha"
          value={proximaTrilha?.nivel ?? "—"} detail={proximaTrilha?.nome ?? "Em preparação"}
        />
      </section>

      <section className="academy-section">
        <SectionTitle eyebrow="SEU CAMINHO" title="Trilhas de desenvolvimento" />
        {trilhas.length === 0 ? (
          <Empty label="As trilhas por cargo (N1 a N6) estão em preparação. Volte em breve." />
        ) : (
          <div className="academy-track-grid">
            {trilhas.map((trilha) => <TrackCard key={trilha.id} trilha={trilha} />)}
          </div>
        )}
      </section>

      <section className="academy-lower-grid">
        <div className="academy-panel">
          <div className="academy-section-title">
            <div><p className="academy-eyebrow"><i /> CONTEÚDO PUBLICADO</p><h2>Novos na Academy</h2></div>
            <Link href="/academy/novidades" className="academy-back" style={{ margin: 0 }}>Ver todas <ArrowRight size={13} /></Link>
          </div>
          <div className="academy-news-list">
            {novidades.map((item) => <NovidadeRow key={item.id} item={item} />)}
            {!novidades.length && <Empty label="Os primeiros conteúdos serão publicados em breve." />}
          </div>
        </div>
        <Link href="/academy/certificados" className="academy-panel academy-goal">
          <p className="academy-eyebrow"><i /> PRÓXIMA CONQUISTA</p>
          <div className="academy-goal-ring"><span><b>{proximaTrilha?.nivel ?? "—"}</b><small>{proximaTrilha ? `${proximaTrilha.percentual}% concluído` : "trilha inicial"}</small></span></div>
          <h2>{proximaTrilha?.nome ?? "Em preparação"}</h2>
          <p>Conclua as aulas e a avaliação final para emitir seu certificado.</p>
          <span className="academy-coming"><Award size={15} /> Ver meus certificados</span>
        </Link>
      </section>

      <Link href="/academy/biblioteca" className="academy-section academy-library">
        <div><p className="academy-eyebrow"><i /> BIBLIOTECA KYRON</p><h2>Conhecimento para consultar na hora certa.</h2><p>Manuais, exemplos e referências práticas reunidos em um só lugar.</p></div>
        <div className="academy-library-count"><Compass size={25} /><span><b>{materiais.length}</b><small>materiais publicados</small></span></div>
      </Link>
    </>
  );
}

function ContinueCard({ alvo }: { alvo: TrilhaCard | null | undefined }) {
  const temAula = Boolean(alvo?.proximaAulaSlug);
  const href = temAula ? `/academy/aula/${alvo!.proximaAulaSlug}` : "/academy/trilhas";
  const iniciando = temAula && alvo!.percentual === 0;
  return (
    <section className="academy-continue">
      <div className="academy-continue-art">
        <span className="orbit one" /><span className="orbit two" /><span className="orbit three" />
        <span className="academy-target"><Target size={48} /></span>
        <span className="academy-lesson-pill"><Play size={11} fill="currentColor" /> {alvo ? `TRILHA ${alvo.nivel} · ${alvo.nome.toUpperCase()}` : "SEU CAMINHO NA ACADEMY"}</span>
      </div>
      <div className="academy-continue-copy">
        <p className="academy-eyebrow blue"><i /> {temAula ? (iniciando ? "COMECE POR AQUI" : "CONTINUE DE ONDE PAROU") : "SUA JORNADA COMEÇA AQUI"}</p>
        <h2>{alvo?.proximaAulaTitulo ?? "As trilhas por cargo estão em preparação"}</h2>
        <p>{temAula ? `Parte da trilha ${alvo!.nome}, nível ${alvo!.nivel}.` : "Assim que a primeira trilha for publicada, ela aparece aqui."}</p>
        <div className="academy-meta"><span><Clock3 size={14} /> No seu ritmo</span><span><BookOpen size={14} /> {alvo ? `Trilha ${alvo.nivel}` : "Em breve"}</span></div>
        <div className="academy-progress"><span><i style={{ width: `${alvo?.percentual ?? 0}%` }} /></span><small>{alvo ? `${alvo.percentual}% da trilha concluído` : "Seu progresso aparece aqui assim que começar"}</small></div>
        <Link href={href} className="academy-primary"><Play size={16} fill="currentColor" /> {iniciando ? "Começar aula" : temAula ? "Continuar aula" : "Ver trilhas"}<ArrowRight size={16} /></Link>
      </div>
      <span className="academy-track-number">{alvo?.nivel ?? "01"}</span>
    </section>
  );
}

function Stat({ icon, tone, label, value, detail }: { icon: React.ReactNode; tone: string; label: string; value: string; detail: string }) {
  return <article><span className={`academy-stat-icon ${tone}`}>{icon}</span><div><small>{label}</small><b>{value}</b><em>{detail}</em></div></article>;
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div className="academy-section-title"><div><p className="academy-eyebrow"><i /> {eyebrow}</p><h2>{title}</h2></div></div>;
}

function TrackCard({ trilha }: { trilha: TrilhaCard }) {
  const disponivel = trilha.totalAulas > 0;
  return (
    <article className="academy-track">
      <div className="academy-track-art" style={trilha.corHex ? { background: `radial-gradient(circle at 66% 50%, ${trilha.corHex}4d, transparent 27%), linear-gradient(125deg,#0b1420,#12243a)` } : undefined}>
        <span>{trilha.sigla ?? trilha.nivel}</span><i /><small>KYRON ACADEMY</small>
      </div>
      <div className="academy-track-body">
        <span className="academy-level">{trilha.nivel}</span>
        <h3>{trilha.nome}</h3>
        <p>{trilha.descricao}</p>
        <div className="academy-track-meta">
          <span><LayoutDashboard size={13} /> {trilha.totalAulas} aula(s)</span>
          <span><Clock3 size={13} /> {trilha.percentual}% concluído</span>
        </div>
        {disponivel
          ? <Link href={trilha.proximaAulaSlug ? `/academy/aula/${trilha.proximaAulaSlug}` : `/academy/trilhas/${trilha.slug}`} className="academy-secondary">{trilha.percentual > 0 ? "Continuar" : "Começar"} trilha <ArrowRight size={15} /></Link>
          : <span className="academy-locked"><LockKeyhole size={14} /> Em preparação</span>}
      </div>
    </article>
  );
}

function NovidadeRow({ item }: { item: NovidadeAluno }) {
  return <Link href={item.href} className="academy-news"><span className={item.eVideo ? "video" : "manual"}>{item.eVideo ? <Play size={20} /> : <BookOpen size={20} />}</span><div><em>{item.tipoLabel}</em><b>{item.titulo}</b><small>{item.resumo ?? "Conteúdo Kyron Academy"}</small></div><ArrowRight size={16} /></Link>;
}

function Empty({ label }: { label: string }) {
  return <div className="academy-empty"><Sparkles size={18} /><span>{label}</span></div>;
}
