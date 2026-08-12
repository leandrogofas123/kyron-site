import type { Metadata } from "next";
import Link from "next/link";
import { Download, FileText } from "lucide-react";

import { VoltarLink } from "@/components/academy/VoltarLink";
import { getMateriaisAluno } from "@/lib/academy/aluno-dados";
import { guardaAcademy } from "@/lib/auth/areas";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Biblioteca" };

export default async function AppBibliotecaPage() {
  await guardaAcademy(); // aprovado já garantido pelo layout (painel)
  const materiais = await getMateriaisAluno();

  return (
    <>
      <VoltarLink href="/app" label="Início" />
      <div className="academy-welcome">
        <div>
          <p className="academy-eyebrow blue"><i /> KYRON ACADEMY</p>
          <h1>Biblioteca</h1>
          <p>Manuais, apresentações e planilhas reunidos em um só lugar.</p>
        </div>
      </div>

      {materiais.length === 0 ? (
        <div className="academy-panel" style={{ textAlign: "center", padding: "48px 24px" }}>
          <FileText size={28} color="var(--academy-blue-bright)" />
          <p style={{ marginTop: 12, color: "var(--academy-muted)", fontSize: 12 }}>
            Nenhum material publicado ainda. Volte em breve.
          </p>
        </div>
      ) : (
        <div className="academy-news-list academy-panel">
          {materiais.map((m) => (
            <Link key={m.id} href={m.url} target="_blank" className="academy-news">
              <span className="manual"><FileText size={20} /></span>
              <div>
                <em>{m.tipo.toUpperCase()}{m.trilha ? ` · ${m.trilha.nome}` : m.aula ? ` · ${m.aula.titulo}` : " · GERAL"}</em>
                <b>{m.titulo}</b>
                <small>{m.tamanhoKb ? `${m.tamanhoKb} KB` : "Arquivo para download"}</small>
              </div>
              <Download size={16} />
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
