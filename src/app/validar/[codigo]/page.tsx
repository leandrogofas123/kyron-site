import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ShieldAlert } from "lucide-react";

import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ codigo: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { codigo } = await params;
  return { title: `Validar certificado ${codigo}`, robots: { index: false, follow: false } };
}

/** Página pública (sem login): valida um certificado da Kyron Academy pelo código. */
export default async function ValidarCertificadoPage({ params }: Props) {
  const { codigo } = await params;
  const certificado = await db.certificado.findUnique({
    where: { codigo },
    include: { usuario: { select: { nome: true } }, trilha: { select: { nome: true, nivel: true } } },
  });

  return (
    <main className="flex min-h-dvh items-center justify-center bg-kyron-black px-fluid-md py-fluid-xl">
      <div className="w-full max-w-[26rem] rounded-kyron-lg border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-lg text-center">
        <Link href="/" className="kyron-display text-fluid-lg tracking-[0.2em] text-kyron-white">
          KYR<span className="text-kyron-blue">O</span>N
        </Link>
        <p className="kyron-label mt-1 text-fluid-2xs text-kyron-silver/60">Validação de certificado · Academy</p>

        {certificado ? (
          <div className="mt-fluid-lg">
            <CheckCircle2 size={40} className="mx-auto text-emerald-400" />
            <p className="mt-fluid-sm text-fluid-xs uppercase tracking-widest text-emerald-400">Certificado válido</p>
            <h1 className="kyron-display mt-fluid-xs text-fluid-lg text-kyron-white">{certificado.trilha.nome}</h1>
            <p className="mt-fluid-2xs text-fluid-sm text-kyron-silver">{certificado.trilha.nivel} · Kyron Academy</p>

            <div className="mt-fluid-md space-y-fluid-2xs border-t border-[var(--kyron-hairline)] pt-fluid-md text-left text-fluid-sm">
              <p className="flex justify-between"><span className="text-kyron-silver/60">Emitido para</span><span className="text-kyron-white">{certificado.usuario.nome}</span></p>
              <p className="flex justify-between"><span className="text-kyron-silver/60">Data</span><span className="text-kyron-white">{certificado.emitidoEm.toLocaleDateString("pt-BR")}</span></p>
              <p className="flex justify-between"><span className="text-kyron-silver/60">Código</span><span className="text-kyron-white">{certificado.codigo}</span></p>
            </div>
          </div>
        ) : (
          <div className="mt-fluid-lg">
            <ShieldAlert size={40} className="mx-auto text-kyron-blue" />
            <p className="mt-fluid-sm text-fluid-xs uppercase tracking-widest text-kyron-blue">Código não encontrado</p>
            <p className="mt-fluid-2xs text-fluid-sm text-kyron-silver">
              Confira o código informado. Se o problema persistir, fale com a Kyron.
            </p>
          </div>
        )}

        <Link href="/" className="mt-fluid-lg inline-block text-fluid-2xs text-kyron-silver/60 hover:text-kyron-white">
          Voltar ao site
        </Link>
      </div>
    </main>
  );
}
