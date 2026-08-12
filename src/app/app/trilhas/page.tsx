import type { Metadata } from "next";
import Link from "next/link";
import { Award, ChevronRight, Compass } from "lucide-react";

import { guardaAcademy } from "@/lib/auth/areas";
import { getTrilhasAluno } from "@/lib/academy/aluno-dados";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Trilhas" };

const NIVEL_NOME: Record<string, string> = {
  N1: "N1 · Vendedor Júnior", N2: "N2 · Vendedor Intermediário", N3: "N3 · Vendedor Hunter",
  N4: "N4 · Líder de Time", N5: "N5 · Gerente Comercial", N6: "N6 · CEO",
};

export default async function AppTrilhasPage() {
  const usuario = await guardaAcademy();
  if (!usuario.aprovado) return <Aguardando />;

  const trilhas = await getTrilhasAluno(usuario.id);

  return (
    <main className="academy-app">
      <div className="academy-content">
        <div className="academy-welcome">
          <div>
            <p className="academy-eyebrow blue"><i /> KYRON ACADEMY</p>
            <h1>Suas trilhas</h1>
            <p>Escolha uma trilha e continue de onde parou.</p>
          </div>
        </div>

        {trilhas.length === 0 ? (
          <div className="academy-panel" style={{ textAlign: "center", padding: "48px 24px" }}>
            <Compass size={28} color="var(--academy-blue-bright)" />
            <p style={{ marginTop: 12, color: "var(--academy-muted)", fontSize: 12 }}>
              Nenhuma trilha publicada ainda. Volte em breve.
            </p>
          </div>
        ) : (
          <div className="academy-track-grid">
            {trilhas.map((t) => (
              <Link key={t.id} href={`/app/trilhas/${t.slug}`} className="academy-track">
                <div className="academy-track-art">
                  <span>{t.sigla ?? t.nome.slice(0, 3).toUpperCase()}</span>
                  <i />
                  <small>{NIVEL_NOME[t.nivel] ?? t.nivel}</small>
                </div>
                <div className="academy-track-body">
                  <span className="academy-level">{t.nivel}</span>
                  <h3>{t.nome}</h3>
                  <p>{t.descricao ?? ""}</p>
                  <div className="academy-track-meta">
                    <span>{t.aulasConcluidas}/{t.totalAulas} aulas</span>
                    <span>{t.percentual}% concluído</span>
                  </div>
                  <span className="academy-secondary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    {t.percentual > 0 ? "Continuar" : "Começar"} <ChevronRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function Aguardando() {
  return (
    <main className="academy-pending">
      <div>
        <div className="academy-pending-icon"><Award size={26} /></div>
        <p className="academy-eyebrow blue"><i /> ACESSO EM ANÁLISE</p>
        <h1>Sua conta está em análise.</h1>
        <p>A equipe Kyron aprova novos acessos rapidamente.</p>
      </div>
    </main>
  );
}
