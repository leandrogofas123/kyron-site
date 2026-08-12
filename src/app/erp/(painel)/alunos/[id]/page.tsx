import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Award, Zap } from "lucide-react";

import { ConcederConquistaForm, ConcederXpForm } from "@/components/erp/academy/ConcederXpForm";
import { EmitirCertificadoBotao } from "@/components/erp/academy/EmitirCertificadoBotao";
import { getAlunoDetalheAdmin } from "@/lib/academy/dados";
import { nivelPorXp } from "@/lib/academy/progresso";
import { colaboradorLogado, podeFazer } from "@/lib/erp/auth";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const dados = await getAlunoDetalheAdmin(Number(id));
  return { title: dados ? dados.usuario.nome : "Aluno" };
}

export default async function AlunoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const eu = await colaboradorLogado();
  if (!eu || !podeFazer(eu.papel, "alunos")) {
    return (
      <div className="mx-auto max-w-[40rem] rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-lg text-center">
        <h1 className="kyron-display text-fluid-lg text-kyron-white">Acesso restrito</h1>
      </div>
    );
  }

  const { id: idParam } = await params;
  const id = Number(idParam);
  const dados = await getAlunoDetalheAdmin(id);
  if (!dados) notFound();

  const { usuario, perfil, trilhas, conquistasGanhas, certificados, todasConquistas } = dados;
  const xpTotal = perfil?.xpTotal ?? 0;
  const nivel = perfil?.nivel ?? nivelPorXp(xpTotal);
  const conquistasDisponiveis = todasConquistas.filter((c) => !conquistasGanhas.some((g) => g.conquistaId === c.id));

  return (
    <>
      <Link href="/erp/alunos" className="mb-fluid-sm inline-flex items-center gap-fluid-2xs text-fluid-2xs text-kyron-silver/70 hover:text-kyron-white">
        <ArrowLeft size={13} /> Todos os alunos
      </Link>

      <div className="mb-fluid-lg">
        <h1 className="kyron-display text-fluid-xl text-kyron-white">{usuario.nome}</h1>
        <p className="text-fluid-2xs text-kyron-silver/60">{usuario.email} · {usuario.aprovado ? "aprovado" : "pendente"}</p>
      </div>

      <div className="mb-fluid-lg grid grid-cols-3 gap-fluid-sm">
        <div className="rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-sm text-center">
          <Zap size={18} className="mx-auto text-kyron-blue" />
          <p className="mt-fluid-2xs text-fluid-lg text-kyron-white">{xpTotal}</p>
          <p className="kyron-label text-fluid-2xs text-kyron-silver/50">XP total</p>
        </div>
        <div className="rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-sm text-center">
          <p className="mt-fluid-2xs text-fluid-lg text-kyron-white">{nivel}</p>
          <p className="kyron-label text-fluid-2xs text-kyron-silver/50">Nível</p>
        </div>
        <div className="rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-sm text-center">
          <p className="mt-fluid-2xs text-fluid-lg text-kyron-white">{perfil?.streakDias ?? 0}</p>
          <p className="kyron-label text-fluid-2xs text-kyron-silver/50">Dias seguidos</p>
        </div>
      </div>

      <div className="space-y-fluid-lg">
        <section className="rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-md">
          <h2 className="kyron-label mb-fluid-sm text-fluid-xs text-kyron-silver/70">Conceder manualmente</h2>
          <div className="space-y-fluid-sm">
            <ConcederXpForm usuarioId={id} />
            <ConcederConquistaForm usuarioId={id} conquistas={conquistasDisponiveis} />
          </div>
        </section>

        <section className="rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-md">
          <h2 className="kyron-label mb-fluid-sm text-fluid-xs text-kyron-silver/70">Trilhas e certificados</h2>
          {trilhas.length === 0 ? (
            <p className="text-fluid-2xs text-kyron-silver/50">Nenhuma trilha publicada ainda.</p>
          ) : (
            <div className="space-y-fluid-xs">
              {trilhas.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-fluid-sm border-b border-[var(--kyron-hairline)] pb-fluid-xs last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-fluid-sm text-kyron-white">{t.nivel} · {t.nome}</p>
                    <p className="text-fluid-2xs text-kyron-silver/50">{t.percentual}% concluído</p>
                  </div>
                  <EmitirCertificadoBotao usuarioId={id} trilhaId={t.id} jaEmitido={t.jaTemCertificado} />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-md">
          <h2 className="kyron-label mb-fluid-sm text-fluid-xs text-kyron-silver/70">Conquistas e certificados já concedidos</h2>
          <div className="flex flex-wrap gap-fluid-xs">
            {conquistasGanhas.map((g) => (
              <span key={g.conquistaId} className="flex items-center gap-fluid-2xs rounded-kyron-sm border border-[var(--kyron-hairline)] px-fluid-sm py-fluid-2xs text-fluid-2xs text-kyron-white">
                <Award size={13} className="text-kyron-blue" /> {g.conquista.nome}
              </span>
            ))}
            {conquistasGanhas.length === 0 && certificados.length === 0 && (
              <p className="text-fluid-2xs text-kyron-silver/50">Nenhuma conquista ou certificado ainda.</p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
