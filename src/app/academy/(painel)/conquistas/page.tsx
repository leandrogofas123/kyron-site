import type { Metadata } from "next";
import { Award, Lock } from "lucide-react";

import { VoltarLink } from "@/components/academy/VoltarLink";
import { getConquistasAluno } from "@/lib/academy/aluno-dados";
import { guardaAcademy } from "@/lib/auth/areas";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Conquistas" };

const dataBR = (d: Date) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(d);

export default async function AppConquistasPage() {
  const usuario = await guardaAcademy(); // aprovado já garantido pelo layout (painel)
  const conquistas = await getConquistasAluno(usuario.id);
  const ganhas = conquistas.filter((c) => c.conquistada).length;

  return (
    <>
      <VoltarLink href="/academy" label="Início" />
      <div className="academy-welcome">
        <div>
          <p className="academy-eyebrow blue"><i /> KYRON ACADEMY</p>
          <h1>Conquistas</h1>
          <p>{ganhas} de {conquistas.length} conquistadas.</p>
        </div>
      </div>

      <div className="academy-track-grid">
        {conquistas.map((c) => (
          <article key={c.id} className="academy-track" style={{ opacity: c.conquistada ? 1 : .55 }}>
            <div className="academy-track-body" style={{ textAlign: "center", paddingTop: 24 }}>
              <span style={{
                display: "inline-flex", width: 52, height: 52, borderRadius: "50%",
                alignItems: "center", justifyContent: "center", marginBottom: 12,
                background: c.conquistada ? "rgba(37,135,255,.14)" : "rgba(255,255,255,.04)",
                color: c.conquistada ? "var(--academy-blue-bright)" : "var(--academy-dim)",
                fontSize: c.icone ? 24 : undefined,
              }}>
                {c.icone || (c.conquistada ? <Award size={24} /> : <Lock size={20} />)}
              </span>
              <h3>{c.nome}</h3>
              <p>{c.descricao}</p>
              {c.conquistada && c.conquistadoEm && (
                <p style={{ marginTop: 8, fontSize: 8, color: "var(--academy-dim)" }}>Conquistada em {dataBR(c.conquistadoEm)}</p>
              )}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
