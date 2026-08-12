import type { Metadata } from "next";
import Link from "next/link";

import { BadgeStatus } from "@/components/erp/academy/AcoesStatus";
import { TrilhaForm } from "@/components/erp/academy/TrilhaForm";
import { contadoresAcademy, getTrilhasAdmin } from "@/lib/academy/dados";
import { exigirPermissao } from "@/lib/auth/service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Kyron Academy" };

const NIVEL_NOME: Record<string, string> = { N1: "N1 · Fundamentos", N2: "N2 · Intermediário", N3: "N3 · Hunter" };

export default async function ErpAcademyPage() {
  await exigirPermissao("academy.conteudo.ver");

  const [trilhas, contadores] = await Promise.all([getTrilhasAdmin(), contadoresAcademy()]);

  return (
    <>
      <div className="mb-fluid-lg">
        <h1 className="kyron-display text-fluid-xl text-kyron-white">Kyron Academy</h1>
        <p className="text-fluid-2xs text-kyron-silver/60">
          Hierarquia Trilha → Módulo → Aula. Aluno só vê o que está{" "}
          <span className="text-emerald-400">Publicado</span>.
        </p>
      </div>

      <div className="mb-fluid-lg grid grid-cols-2 gap-fluid-sm sm:grid-cols-5">
        {[
          ["Trilhas", contadores.trilhas],
          ["Publicadas", contadores.publicadas],
          ["Aulas", contadores.aulas],
          ["Aulas publicadas", contadores.aulasPublicadas],
          ["Alunos aprovados", contadores.alunosAprovados],
        ].map(([rotulo, valor]) => (
          <div key={rotulo} className="rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-sm">
            <p className="kyron-label text-fluid-2xs text-kyron-silver/50">{rotulo}</p>
            <p className="kyron-display mt-fluid-2xs text-fluid-lg text-kyron-white">{valor}</p>
          </div>
        ))}
      </div>

      <div className="mb-fluid-lg overflow-hidden rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite">
        {trilhas.length === 0 ? (
          <p className="p-fluid-lg text-center text-fluid-sm text-kyron-silver/60">Nenhuma trilha ainda.</p>
        ) : (
          <ul className="divide-y divide-[var(--kyron-hairline)]">
            {trilhas.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/erp/academy/trilhas/${t.id}`}
                  className="flex flex-wrap items-center gap-fluid-sm p-fluid-sm transition-colors hover:bg-kyron-black/30"
                >
                  <span className="kyron-label w-14 shrink-0 text-fluid-xs text-kyron-blue">{t.sigla ?? "—"}</span>
                  <div className="min-w-[10rem] flex-1">
                    <p className="text-fluid-base text-kyron-white">{t.nome}</p>
                    <p className="text-fluid-2xs text-kyron-silver/50">
                      {NIVEL_NOME[t.nivel] ?? t.nivel} · {t._count.modulos} módulo(s) · {t.totalAulas} aula(s)
                    </p>
                  </div>
                  <BadgeStatus status={t.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-md">
        <h2 className="kyron-label mb-fluid-sm text-fluid-xs text-kyron-silver/70">Nova trilha</h2>
        <TrilhaForm />
      </div>
    </>
  );
}
