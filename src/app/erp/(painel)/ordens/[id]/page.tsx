import Link from "next/link";
import { notFound } from "next/navigation";

import { ControleOS } from "@/components/erp/ControleOS";
import { colaboradorLogado, podeFazer } from "@/lib/erp/auth";
import { obterOS, rotuloStatusOS, tecnicosDisponiveis } from "@/lib/ordens/os";

export const dynamic = "force-dynamic";

export default async function FichaOS({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const osId = Number(id);
  if (!Number.isInteger(osId)) notFound();

  const eu = await colaboradorLogado();
  if (!eu || !podeFazer(eu.papel, "estoque.movimentar")) notFound();

  const [os, tecnicos] = await Promise.all([obterOS(osId), tecnicosDisponiveis()]);
  if (!os) notFound();

  const ficha: Array<[string, string | null]> = [
    ["Marca / modelo", [os.marca, os.modelo].filter(Boolean).join(" ") || null],
    ["IMEI", os.imei],
    ["Nº série", os.serial],
  ];

  return (
    <>
      <div className="mb-fluid-lg">
        <Link href="/erp/ordens" className="text-fluid-2xs text-kyron-silver hover:text-kyron-white">
          ← Ordens de serviço
        </Link>
        <h1 className="kyron-display mt-fluid-2xs text-fluid-xl text-kyron-white">
          OS #{os.id} · {os.equipamento}
        </h1>
        <p className="text-fluid-2xs text-kyron-silver/60">
          {os.cliente ? (
            <Link href={`/erp/clientes/${os.cliente.id}`} className="hover:text-kyron-white">
              {os.clienteNome}
            </Link>
          ) : (
            os.clienteNome
          )}
          {" · "}
          {rotuloStatusOS(os.status)}
        </p>
      </div>

      <div className="mb-fluid-lg rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-md">
        <p className="text-fluid-2xs text-kyron-silver/60">Defeito relatado</p>
        <p className="text-fluid-sm text-kyron-white">{os.defeito}</p>
        <div className="mt-fluid-sm flex flex-wrap gap-fluid-md">
          {ficha
            .filter(([, v]) => v)
            .map(([r, v]) => (
              <span key={r} className="text-fluid-2xs text-kyron-silver/60">
                {r}: <span className="text-kyron-silver">{v}</span>
              </span>
            ))}
        </div>
      </div>

      <ControleOS
        os={{
          id: os.id,
          status: os.status,
          diagnostico: os.diagnostico,
          solucao: os.solucao,
          valor: os.valor,
          garantiaMeses: os.garantiaMeses,
          tecnicoId: os.tecnicoId,
          tecnicoNome: os.tecnicoNome,
        }}
        tecnicos={tecnicos}
      />
    </>
  );
}
