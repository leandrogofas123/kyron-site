import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Circle, FileText, HelpCircle, PlayCircle } from "lucide-react";

import { VoltarLink } from "@/components/academy/VoltarLink";
import { getTrilhaAluno } from "@/lib/academy/aluno-dados";
import { guardaAcademy } from "@/lib/auth/areas";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug };
}

const ICONE: Record<string, React.ElementType> = { VIDEO: PlayCircle, TEXTO: FileText, QUIZ: HelpCircle, PDF: FileText };

export default async function AppTrilhaPage({ params }: Props) {
  const usuario = await guardaAcademy(); // aprovado já garantido pelo layout (painel)
  const { slug } = await params;

  const trilha = await getTrilhaAluno(slug, usuario.id);
  if (!trilha) notFound();

  return (
    <>
      <VoltarLink href="/academy/trilhas" label="Todas as trilhas" />

      <div className="academy-welcome">
        <div>
          <p className="academy-eyebrow blue"><i /> {trilha.sigla ?? ""} · {trilha.nivel}</p>
          <h1>{trilha.nome}</h1>
          {trilha.descricao && <p>{trilha.descricao}</p>}
        </div>
      </div>

      {trilha.modulos.length === 0 && (
        <div className="academy-panel" style={{ textAlign: "center", padding: 40 }}>
          <p style={{ color: "var(--academy-muted)", fontSize: 12 }}>Conteúdo em preparação.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}>
        {trilha.modulos.map((modulo) => (
          <section key={modulo.id} className="academy-panel">
            <div className="academy-ph" style={{ padding: "14px 18px" }}>
              <h2 style={{ margin: 0, fontSize: 13, letterSpacing: ".08em", color: "var(--academy-text)" }}>{modulo.nome}</h2>
            </div>
            <div>
              {modulo.aulas.map((aula) => {
                const Icone = ICONE[aula.tipo] ?? FileText;
                const concluida = aula.progresso?.status === "CONCLUIDA";
                return (
                  <Link
                    key={aula.id}
                    href={`/academy/aula/${aula.slug}`}
                    className="academy-news"
                    style={{ padding: "12px 18px", borderTop: "1px solid var(--academy-border-soft)" }}
                  >
                    <span className={concluida ? "manual" : undefined} style={{ color: concluida ? "var(--academy-green)" : undefined }}>
                      {concluida ? <CheckCircle2 size={16} /> : <Icone size={16} />}
                    </span>
                    <div>
                      <b>{aula.titulo}</b>
                      <small>{aula.duracaoMin} min · {aula.xp} XP{aula.restrita ? " · restrita" : ""}</small>
                    </div>
                    {!concluida && <Circle size={14} color="var(--academy-dim)" />}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
