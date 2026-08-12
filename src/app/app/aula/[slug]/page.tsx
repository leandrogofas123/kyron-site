import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";

import { guardaAcademy } from "@/lib/auth/areas";
import { getAulaAluno } from "@/lib/academy/aluno-dados";
import { acaoConcluirAula, acaoHeartbeat, acaoResponderQuiz } from "@/lib/academy/aluno-acoes";
import { AulaPlayer } from "./AulaPlayer";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug };
}

export default async function AppAulaPage({ params }: Props) {
  const usuario = await guardaAcademy();
  const { slug } = await params;
  if (!usuario.aprovado) notFound();

  const aula = await getAulaAluno(slug, usuario.id);
  if (!aula) notFound();

  const concluir = acaoConcluirAula.bind(null, aula.id, aula.trilha.slug);
  const heartbeat = acaoHeartbeat;
  const responderQuiz = aula.quiz ? acaoResponderQuiz.bind(null, aula.quiz.id, aula.trilha.slug) : null;

  return (
    <main className="academy-app">
      <div className="academy-content" style={{ maxWidth: 760 }}>
        <Link href={`/app/trilhas/${aula.trilha.slug}`} className="academy-login-back">
          <ArrowLeft size={15} /> {aula.trilha.nome}
        </Link>

        <div style={{ marginTop: 18 }}>
          <p className="academy-eyebrow blue"><i /> {aula.modulo.nome.toUpperCase()}</p>
          <h1 style={{ margin: "10px 0 8px", color: "var(--academy-text)", fontSize: "clamp(1.4rem,2.4vw,1.9rem)", letterSpacing: "-.03em" }}>
            {aula.titulo}
          </h1>
          {aula.resumo && <p style={{ color: "var(--academy-muted)", fontSize: 13, marginBottom: 20 }}>{aula.resumo}</p>}
        </div>

        {aula.bloqueadaPor ? (
          <div className="academy-panel" style={{ textAlign: "center", padding: 40 }}>
            <Lock size={24} color="var(--academy-dim)" />
            <p style={{ marginTop: 12, color: "var(--academy-muted)", fontSize: 13 }}>
              Conclua <strong style={{ color: "var(--academy-text)" }}>{aula.bloqueadaPor.titulo}</strong> antes desta aula.
            </p>
          </div>
        ) : (
          <AulaPlayer
            aulaId={aula.id}
            tipo={aula.tipo}
            youtubeId={aula.youtubeId}
            conteudoMd={aula.conteudoMd}
            percentualInicial={aula.progresso?.percentual ?? 0}
            jaConcluida={aula.progresso?.status === "CONCLUIDA"}
            quiz={aula.quiz}
            onHeartbeat={heartbeat}
            onConcluir={concluir}
            onResponderQuiz={responderQuiz ?? (async () => ({ ok: false, motivo: "Sem quiz nesta aula." }))}
          />
        )}
      </div>
    </main>
  );
}
