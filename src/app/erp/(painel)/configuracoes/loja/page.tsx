import Link from "next/link";

import { ConfigForm } from "@/components/erp/ConfigForm";
import { CHAVES, obterConfigs } from "@/lib/configuracao/config";
import { colaboradorLogado, podeFazer } from "@/lib/erp/auth";

export const dynamic = "force-dynamic";

export default async function ErpConfigLoja() {
  const eu = await colaboradorLogado();
  if (!eu || !podeFazer(eu.papel, "financeiro")) {
    return (
      <div className="mx-auto max-w-[40rem] rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-lg text-center">
        <h1 className="kyron-display text-fluid-lg text-kyron-white">Acesso restrito</h1>
        <p className="mt-fluid-sm text-fluid-base text-kyron-silver">
          As configurações da loja são editáveis por administradores.
        </p>
      </div>
    );
  }

  const c = await obterConfigs();

  return (
    <>
      <div className="mb-fluid-lg">
        <Link href="/erp/configuracoes" className="text-fluid-2xs text-kyron-silver hover:text-kyron-white">← Configurações</Link>
        <h1 className="kyron-display mt-fluid-2xs text-fluid-xl text-kyron-white">Loja & site</h1>
        <p className="text-fluid-2xs text-kyron-silver/60">
          O que muda com frequência, editável sem depender de código nem deploy.
        </p>
      </div>

      <ConfigForm
        valores={{
          avisoAtivo: c[CHAVES.avisoAtivo] === "1",
          avisoTexto: c[CHAVES.avisoTexto] ?? "",
          horario: c[CHAVES.horario] ?? "",
        }}
      />
    </>
  );
}
