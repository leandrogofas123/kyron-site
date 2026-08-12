import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Play, Sparkles } from "lucide-react";

import { VoltarLink } from "@/components/academy/VoltarLink";
import { getNovidadesAluno } from "@/lib/academy/aluno-dados";
import { guardaAcademy } from "@/lib/auth/areas";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Novidades" };

export default async function AppNovidadesPage() {
  await guardaAcademy(); // aprovado já garantido pelo layout (painel)
  const novidades = await getNovidadesAluno(30);

  return (
    <>
      <VoltarLink href="/app" label="Início" />
      <div className="academy-welcome">
        <div>
          <p className="academy-eyebrow blue"><i /> KYRON ACADEMY</p>
          <h1>Novidades</h1>
          <p>Tudo o que foi publicado recentemente — aulas e materiais.</p>
        </div>
      </div>

      {novidades.length === 0 ? (
        <div className="academy-panel" style={{ textAlign: "center", padding: "48px 24px" }}>
          <Sparkles size={28} color="var(--academy-blue-bright)" />
          <p style={{ marginTop: 12, color: "var(--academy-muted)", fontSize: 12 }}>
            Os primeiros conteúdos serão publicados em breve.
          </p>
        </div>
      ) : (
        <div className="academy-news-list academy-panel">
          {novidades.map((item) => (
            <Link key={item.id} href={item.href} className="academy-news">
              <span className={item.eVideo ? "video" : "manual"}>{item.eVideo ? <Play size={20} /> : <BookOpen size={20} />}</span>
              <div>
                <em>{item.tipoLabel}</em>
                <b>{item.titulo}</b>
                <small>{item.resumo ?? "Conteúdo Kyron Academy"}</small>
              </div>
              <ArrowRight size={16} />
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
