import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { alunosInativos, aulasComMaisAbandono, conclusaoPorTrilha } from "@/lib/academy/relatorios";
import { exigirPermissao } from "@/lib/auth/service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Relatórios · Kyron Academy" };

export default async function ErpAcademyRelatoriosPage() {
  await exigirPermissao("academy.aluno.progresso.ver");

  const [trilhas, abandono, inativos] = await Promise.all([
    conclusaoPorTrilha(), aulasComMaisAbandono(), alunosInativos(),
  ]);

  return (
    <>
      <Link href="/erp/academy" className="mb-fluid-sm inline-flex items-center gap-fluid-2xs text-fluid-2xs text-kyron-silver/70 hover:text-kyron-white">
        <ArrowLeft size={13} /> Kyron Academy
      </Link>

      <div className="mb-fluid-lg">
        <h1 className="kyron-display text-fluid-xl text-kyron-white">Relatórios</h1>
        <p className="text-fluid-2xs text-kyron-silver/60">Conclusão, abandono e engajamento dos alunos aprovados.</p>
      </div>

      <div className="mb-fluid-lg grid grid-cols-2 gap-fluid-sm sm:grid-cols-4">
        {[
          ["Alunos aprovados", inativos.total],
          ["Nunca começaram", inativos.nuncaComecou],
          ["Inativos 14 dias", inativos.inativos14],
          ["Inativos 30 dias", inativos.inativos30],
        ].map(([rotulo, valor]) => (
          <div key={rotulo} className="rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-sm">
            <p className="kyron-label text-fluid-2xs text-kyron-silver/50">{rotulo}</p>
            <p className="kyron-display mt-fluid-2xs text-fluid-lg text-kyron-white">{valor}</p>
          </div>
        ))}
      </div>

      <div className="mb-fluid-lg overflow-hidden rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite">
        <h2 className="kyron-label border-b border-[var(--kyron-hairline)] p-fluid-sm text-fluid-xs text-kyron-silver/70">
          Conclusão média por trilha
        </h2>
        {trilhas.length === 0 ? (
          <p className="p-fluid-lg text-center text-fluid-sm text-kyron-silver/60">Nenhuma trilha ainda.</p>
        ) : (
          <ul className="divide-y divide-[var(--kyron-hairline)]">
            {trilhas.map((t) => (
              <li key={t.id} className="flex items-center gap-fluid-sm p-fluid-sm">
                <span className="kyron-label w-8 shrink-0 text-fluid-2xs text-kyron-blue">{t.nivel}</span>
                <div className="min-w-[10rem] flex-1">
                  <p className="text-fluid-sm text-kyron-white">{t.nome}</p>
                  <p className="text-fluid-2xs text-kyron-silver/50">{t.aulas} aula(s) publicada(s)</p>
                </div>
                <span className="kyron-display text-fluid-base text-kyron-white">{t.conclusaoMedia}%</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="overflow-hidden rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite">
        <h2 className="kyron-label border-b border-[var(--kyron-hairline)] p-fluid-sm text-fluid-xs text-kyron-silver/70">
          Aulas com mais abandono
        </h2>
        {abandono.length === 0 ? (
          <p className="p-fluid-lg text-center text-fluid-sm text-kyron-silver/60">Sem dados suficientes ainda.</p>
        ) : (
          <ul className="divide-y divide-[var(--kyron-hairline)]">
            {abandono.map((a) => (
              <li key={a.id} className="flex items-center gap-fluid-sm p-fluid-sm">
                <div className="min-w-[10rem] flex-1">
                  <p className="text-fluid-sm text-kyron-white">{a.titulo}</p>
                  <p className="text-fluid-2xs text-kyron-silver/50">{a.trilha} · {a.modulo}</p>
                </div>
                <span className="text-fluid-2xs text-kyron-silver/60">{a.concluidas}/{a.iniciadas} concluíram</span>
                <span className="kyron-display text-fluid-base text-[var(--kyron-amber,#d9902f)]">{a.abandono}%</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
