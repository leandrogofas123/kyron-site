import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PreRequisitoForm } from "@/components/erp/academy/PreRequisitoForm";
import { QuizEditor } from "@/components/erp/academy/QuizEditor";
import { getAulaAdminCompleta, getOutrasAulasDaTrilha } from "@/lib/academy/dados";
import { exigirPermissao } from "@/lib/auth/service";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const aula = await getAulaAdminCompleta(Number(id));
  return { title: aula ? `${aula.titulo} · avançado` : "Aula" };
}

export default async function AulaAvancadoPage({ params }: { params: Promise<{ id: string }> }) {
  await exigirPermissao("academy.conteudo.gerenciar");

  const { id: idParam } = await params;
  const id = Number(idParam);
  const aula = await getAulaAdminCompleta(id);
  if (!aula) notFound();

  const trilhaId = aula.modulo.trilha.id;
  const outrasAulas = await getOutrasAulasDaTrilha(trilhaId, id);

  return (
    <>
      <Link href={`/erp/academy/trilhas/${trilhaId}`} className="mb-fluid-sm inline-flex items-center gap-fluid-2xs text-fluid-2xs text-kyron-silver/70 hover:text-kyron-white">
        <ArrowLeft size={13} /> {aula.modulo.trilha.nome}
      </Link>

      <div className="mb-fluid-lg">
        <p className="kyron-label text-fluid-2xs text-kyron-blue">CONFIGURAÇÕES AVANÇADAS</p>
        <h1 className="kyron-display text-fluid-xl text-kyron-white">{aula.titulo}</h1>
      </div>

      <div className="space-y-fluid-lg">
        <section className="rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-md">
          <h2 className="kyron-label mb-fluid-sm text-fluid-xs text-kyron-silver/70">Pré-requisitos</h2>
          <PreRequisitoForm
            aulaId={id}
            outrasAulas={outrasAulas}
            atuais={aula.preRequisitos.map((p) => p.dependeDeId)}
          />
        </section>

        {aula.tipo === "QUIZ" && (
          <section className="rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-md">
            <h2 className="kyron-label mb-fluid-sm text-fluid-xs text-kyron-silver/70">Quiz</h2>
            <QuizEditor aulaId={id} quiz={aula.quiz} />
          </section>
        )}
      </div>
    </>
  );
}
