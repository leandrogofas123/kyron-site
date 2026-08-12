import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AulaAcademyForm } from "@/components/erp/academy/AulaAcademyForm";
import { AulaLinha } from "@/components/erp/academy/AulaLinha";
import { ModuloBloco } from "@/components/erp/academy/ModuloBloco";
import { ModuloForm } from "@/components/erp/academy/ModuloForm";
import { TrilhaCabecalho } from "@/components/erp/academy/TrilhaCabecalho";
import {
  acaoArquivarAulaAcademy, acaoArquivarModulo, acaoArquivarTrilha,
  acaoDespublicarAulaAcademy, acaoDespublicarModulo, acaoDespublicarTrilha,
  acaoMoverAula, acaoMoverModulo,
  acaoPublicarAulaAcademy, acaoPublicarModulo, acaoPublicarTrilha,
} from "@/lib/academy/acoes";
import { getTrilhaAdmin } from "@/lib/academy/dados";
import { exigirPermissao } from "@/lib/auth/service";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const trilha = await getTrilhaAdmin(Number(id));
  return { title: trilha?.nome ?? "Trilha" };
}

export default async function ErpTrilhaPage({ params }: { params: Promise<{ id: string }> }) {
  await exigirPermissao("academy.conteudo.ver");

  const { id: idParam } = await params;
  const id = Number(idParam);
  const trilha = await getTrilhaAdmin(id);
  if (!trilha) notFound();

  return (
    <>
      <Link href="/erp/academy" className="mb-fluid-sm inline-flex items-center gap-fluid-2xs text-fluid-2xs text-kyron-silver/70 hover:text-kyron-white">
        <ArrowLeft size={13} /> Todas as trilhas
      </Link>

      <TrilhaCabecalho
        trilha={trilha}
        onPublicar={acaoPublicarTrilha.bind(null, id)}
        onDespublicar={acaoDespublicarTrilha.bind(null, id)}
        onArquivar={acaoArquivarTrilha.bind(null, id)}
      />

      <div className="space-y-fluid-md">
        {trilha.modulos.length === 0 && (
          <p className="rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-lg text-center text-fluid-sm text-kyron-silver/60">
            Nenhum módulo ainda. Crie o primeiro abaixo.
          </p>
        )}

        {trilha.modulos.map((modulo, mi) => (
          <ModuloBloco
            key={modulo.id}
            modulo={modulo}
            trilhaId={id}
            podeSubir={mi > 0}
            podeDescer={mi < trilha.modulos.length - 1}
            onSubir={acaoMoverModulo.bind(null, modulo.id, id, "cima")}
            onDescer={acaoMoverModulo.bind(null, modulo.id, id, "baixo")}
            onPublicar={acaoPublicarModulo.bind(null, modulo.id, id)}
            onDespublicar={acaoDespublicarModulo.bind(null, modulo.id, id)}
            onArquivar={acaoArquivarModulo.bind(null, modulo.id, id)}
          >
            {modulo.aulas.map((aula, ai) => (
              <AulaLinha
                key={aula.id}
                aula={aula}
                trilhaId={id}
                moduloId={modulo.id}
                podeSubir={ai > 0}
                podeDescer={ai < modulo.aulas.length - 1}
                onSubir={acaoMoverAula.bind(null, aula.id, modulo.id, id, "cima")}
                onDescer={acaoMoverAula.bind(null, aula.id, modulo.id, id, "baixo")}
                onPublicar={acaoPublicarAulaAcademy.bind(null, aula.id, id)}
                onDespublicar={acaoDespublicarAulaAcademy.bind(null, aula.id, id)}
                onArquivar={acaoArquivarAulaAcademy.bind(null, aula.id, id)}
              />
            ))}
            <details className="mt-fluid-2xs">
              <summary className="cursor-pointer text-fluid-2xs text-kyron-blue">+ Nova aula</summary>
              <div className="mt-fluid-2xs">
                <AulaAcademyForm trilhaId={id} moduloId={modulo.id} />
              </div>
            </details>
          </ModuloBloco>
        ))}
      </div>

      <div className="mt-fluid-lg rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-md">
        <h2 className="kyron-label mb-fluid-sm text-fluid-xs text-kyron-silver/70">Novo módulo</h2>
        <ModuloForm trilhaId={id} />
      </div>
    </>
  );
}
