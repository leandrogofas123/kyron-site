import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Flame, Target, TrendingUp, Zap } from "lucide-react";

import { VoltarLink } from "@/components/academy/VoltarLink";
import { getEventosXpAluno, getPerfilAluno, getTrilhasAluno } from "@/lib/academy/aluno-dados";
import { NIVEIS } from "@/lib/academy/regras-puras";
import { guardaAcademy } from "@/lib/auth/areas";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Meu progresso" };

const dataBR = (d: Date) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(d);

export default async function AppProgressoPage() {
  const usuario = await guardaAcademy(); // aprovado já garantido pelo layout (painel)
  const [perfil, trilhas, eventos] = await Promise.all([
    getPerfilAluno(usuario.id), getTrilhasAluno(usuario.id), getEventosXpAluno(usuario.id, 15),
  ]);

  // Progresso até o próximo nível (Recruta→Operador→Especialista→Hunter).
  const indiceAtual = NIVEIS.findIndex((n) => n.nome === perfil.nivel);
  const atual = NIVEIS[Math.max(0, indiceAtual)];
  const proximo = NIVEIS[Math.min(NIVEIS.length - 1, Math.max(0, indiceAtual) + 1)];
  const ultimoNivel = atual.nome === proximo.nome;
  const faixa = proximo.minXp - atual.minXp;
  const percentualNivel = ultimoNivel ? 100 : Math.min(100, Math.round(((perfil.xpTotal - atual.minXp) / faixa) * 100));

  return (
    <>
      <VoltarLink href="/app" label="Início" />
      <div className="academy-welcome">
        <div>
          <p className="academy-eyebrow blue"><i /> KYRON ACADEMY</p>
          <h1>Meu progresso</h1>
          <p>Seu XP, nível, sequência e o que você já concluiu.</p>
        </div>
      </div>

      <section className="academy-stats" aria-label="Resumo do progresso">
        <Stat icon={<Zap size={19} />} tone="blue" label="XP total" value={String(perfil.xpTotal)} detail="acumulado" />
        <Stat icon={<TrendingUp size={19} />} tone="violet" label="Nível" value={perfil.nivel} detail={ultimoNivel ? "nível máximo" : `próximo: ${proximo.nome}`} />
        <Stat icon={<Flame size={19} />} tone="orange" label="Sequência" value={String(perfil.streakDias)} detail="dias seguidos" />
        <Stat icon={<Target size={19} />} tone="green" label="Trilhas em dia" value={String(trilhas.filter((t) => t.percentual === 100).length)} detail={`de ${trilhas.length}`} />
      </section>

      <section className="academy-panel" style={{ marginTop: 20, padding: 20 }}>
        <p className="academy-eyebrow"><i /> NÍVEL</p>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, color: "var(--academy-text)" }}>
          <b>{atual.nome}</b>
          <span style={{ color: "var(--academy-dim)" }}>{ultimoNivel ? "Nível máximo alcançado" : `${perfil.xpTotal} / ${proximo.minXp} XP`}</span>
        </div>
        <div className="academy-progress" style={{ marginTop: 10 }}>
          <span><i style={{ width: `${percentualNivel}%` }} /></span>
        </div>
        {!ultimoNivel && <small style={{ display: "block", marginTop: 8, color: "var(--academy-dim)", fontSize: 10 }}>Faltam {proximo.minXp - perfil.xpTotal} XP para virar {proximo.nome}</small>}
      </section>

      <section className="academy-section">
        <div className="academy-section-title">
          <div><p className="academy-eyebrow"><i /> POR TRILHA</p><h2>Seu andamento</h2></div>
          <Link href="/app/trilhas" className="academy-back" style={{ margin: 0 }}>Ver trilhas <ArrowRight size={13} /></Link>
        </div>
        <div className="academy-panel">
          {trilhas.length === 0 && <p style={{ padding: 18, textAlign: "center", color: "var(--academy-dim)", fontSize: 12 }}>Nenhuma trilha publicada ainda.</p>}
          {trilhas.map((t) => (
            <div key={t.id} style={{ padding: "12px 18px", borderTop: "1px solid var(--academy-border-soft)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--academy-text)" }}>
                <span>{t.nivel} · {t.nome}</span>
                <span style={{ color: "var(--academy-dim)" }}>{t.aulasConcluidas}/{t.totalAulas} · {t.percentual}%</span>
              </div>
              <div className="academy-progress" style={{ marginTop: 8, marginBottom: 0 }}>
                <span><i style={{ width: `${t.percentual}%` }} /></span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="academy-section">
        <SectionTitle eyebrow="ATIVIDADE RECENTE" title="Histórico de XP" />
        <div className="academy-panel">
          {eventos.length === 0 && <p style={{ padding: 18, textAlign: "center", color: "var(--academy-dim)", fontSize: 12 }}>Nenhuma atividade registrada ainda.</p>}
          {eventos.map((e) => (
            <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 18px", borderTop: "1px solid var(--academy-border-soft)", fontSize: 12 }}>
              <span style={{ color: "var(--academy-text)" }}>{e.descricao}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <small style={{ color: "var(--academy-dim)", fontSize: 10 }}>{dataBR(e.criadoEm)}</small>
                <b style={{ color: "var(--academy-blue-bright)" }}>+{e.xp} XP</b>
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function Stat({ icon, tone, label, value, detail }: { icon: React.ReactNode; tone: string; label: string; value: string; detail: string }) {
  return <article><span className={`academy-stat-icon ${tone}`}>{icon}</span><div><small>{label}</small><b>{value}</b><em>{detail}</em></div></article>;
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div className="academy-section-title"><div><p className="academy-eyebrow"><i /> {eyebrow}</p><h2>{title}</h2></div></div>;
}
