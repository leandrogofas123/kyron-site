import type { Metadata } from "next";
import Link from "next/link";
import { Award, ExternalLink } from "lucide-react";

import { db } from "@/lib/db";
import { guardaAcademy } from "@/lib/auth/areas";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Certificados" };

export default async function AppCertificadosPage() {
  const usuario = await guardaAcademy();
  if (!usuario.aprovado) return null;

  const certificados = await db.certificado.findMany({
    where: { usuarioId: usuario.id },
    include: { trilha: { select: { nome: true, nivel: true, sigla: true } } },
    orderBy: { emitidoEm: "desc" },
  });

  return (
    <main className="academy-app">
      <div className="academy-content">
        <div className="academy-welcome">
          <div>
            <p className="academy-eyebrow blue"><i /> KYRON ACADEMY</p>
            <h1>Meus certificados</h1>
            <p>Emitidos automaticamente ao concluir todas as aulas de uma trilha.</p>
          </div>
        </div>

        {certificados.length === 0 ? (
          <div className="academy-panel" style={{ textAlign: "center", padding: "48px 24px" }}>
            <Award size={28} color="var(--academy-blue-bright)" />
            <p style={{ marginTop: 12, color: "var(--academy-muted)", fontSize: 12 }}>
              Nenhum certificado ainda. Conclua todas as aulas de uma trilha para emitir o seu.
            </p>
          </div>
        ) : (
          <div className="academy-news-list academy-panel">
            {certificados.map((c) => (
              <Link key={c.id} href={`/validar/${c.codigo}`} target="_blank" className="academy-news">
                <span className="manual"><Award size={20} /></span>
                <div>
                  <em>{c.trilha.sigla ?? c.trilha.nivel} · CERTIFICADO</em>
                  <b>{c.trilha.nome}</b>
                  <small>Código {c.codigo} · emitido em {c.emitidoEm.toLocaleDateString("pt-BR")}</small>
                </div>
                <ExternalLink size={16} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
