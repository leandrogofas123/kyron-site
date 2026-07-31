import Link from "next/link";

import { GerenciarBancos } from "@/components/erp/GerenciarBancos";
import { colaboradorLogado, podeFazer } from "@/lib/erp/auth";
import {
  formasParaMapa,
  listarBancos,
  mapaFormaBanco,
  saldoBanco,
  TIPOS_BANCO,
} from "@/lib/financeiro/bancos";

export const dynamic = "force-dynamic";

export default async function ErpBancos() {
  const eu = await colaboradorLogado();
  if (!eu || !podeFazer(eu.papel, "financeiro")) {
    return (
      <div className="mx-auto max-w-[40rem] rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-lg text-center">
        <h1 className="kyron-display text-fluid-lg text-kyron-white">Acesso restrito</h1>
        <p className="mt-fluid-sm text-fluid-base text-kyron-silver">Apenas o financeiro gerencia os bancos.</p>
      </div>
    );
  }

  const [bancos, mapa] = await Promise.all([listarBancos(), mapaFormaBanco()]);
  const comSaldo = await Promise.all(
    bancos.map(async (b) => ({ id: b.id, nome: b.nome, tipo: b.tipo, ativo: b.ativo, ordem: b.ordem, saldo: await saldoBanco(b.id) })),
  );

  return (
    <>
      <div className="mb-fluid-lg">
        <Link href="/erp/configuracoes" className="text-fluid-2xs text-kyron-silver hover:text-kyron-white">← Configurações</Link>
        <h1 className="kyron-display mt-fluid-2xs text-fluid-xl text-kyron-white">Bancos & contas</h1>
        <p className="text-fluid-2xs text-kyron-silver/60">
          Contas e carteiras onde o dinheiro entra. Cada forma de pagamento aponta
          para um banco. Banco com movimentação não pode ser excluído — só desativado.
        </p>
      </div>

      <GerenciarBancos
        bancos={comSaldo}
        tipos={[...TIPOS_BANCO]}
        formas={[...formasParaMapa()]}
        mapaInicial={mapa}
      />
    </>
  );
}
