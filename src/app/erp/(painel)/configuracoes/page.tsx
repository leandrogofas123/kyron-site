import Link from "next/link";

import { colaboradorLogado, podeFazer } from "@/lib/erp/auth";

export const dynamic = "force-dynamic";

/** Seções do hub. `pronto=false` = planejada (aparece esmaecida). */
const SECOES = [
  { grupo: "Loja", titulo: "Loja & site", desc: "Aviso do topo, horário de atendimento.", href: "/erp/configuracoes/loja", pronto: true },
  { grupo: "Financeiro", titulo: "Bancos & contas", desc: "Contas/carteiras e vínculo forma→banco.", href: "/erp/configuracoes/bancos", pronto: true },
  { grupo: "Financeiro", titulo: "Máquinas de cartão", desc: "Modelos, taxas por parcela e prazo.", href: "/erp/maquininhas", pronto: true },
  { grupo: "Vendas", titulo: "Recibo de venda", desc: "Layout do recibo (em breve).", href: "#", pronto: false },
  { grupo: "OS", titulo: "Recibo de OS", desc: "Layout do recibo de serviço (em breve).", href: "#", pronto: false },
  { grupo: "Fornecedor", titulo: "Regimes tributários", desc: "Regimes editáveis (em breve).", href: "#", pronto: false },
];

export default async function ErpConfiguracoes() {
  const eu = await colaboradorLogado();
  if (!eu || !podeFazer(eu.papel, "financeiro")) {
    return (
      <div className="mx-auto max-w-[40rem] rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-lg text-center">
        <h1 className="kyron-display text-fluid-lg text-kyron-white">Acesso restrito</h1>
        <p className="mt-fluid-sm text-fluid-base text-kyron-silver">As configurações são editáveis por administradores.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-fluid-lg">
        <h1 className="kyron-display text-fluid-xl text-kyron-white">Configurações</h1>
        <p className="text-fluid-2xs text-kyron-silver/60">Centraliza os ajustes da plataforma. Cada seção abre sua própria tela.</p>
      </div>

      <div className="grid gap-fluid-sm sm:grid-cols-2 xl:grid-cols-3">
        {SECOES.map((s) =>
          s.pronto ? (
            <Link
              key={s.titulo}
              href={s.href}
              className="rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-md transition-colors hover:border-[var(--kyron-blue-line)]"
            >
              <p className="kyron-label text-fluid-2xs text-kyron-blue">{s.grupo}</p>
              <p className="mt-1 text-fluid-base font-semibold text-kyron-white">{s.titulo}</p>
              <p className="mt-1 text-fluid-2xs text-kyron-silver/60">{s.desc}</p>
            </Link>
          ) : (
            <div key={s.titulo} className="rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite/50 p-fluid-md opacity-55">
              <p className="kyron-label text-fluid-2xs text-kyron-silver/50">{s.grupo}</p>
              <p className="mt-1 text-fluid-base font-semibold text-kyron-silver">{s.titulo}</p>
              <p className="mt-1 text-fluid-2xs text-kyron-silver/50">{s.desc}</p>
            </div>
          ),
        )}
      </div>
    </>
  );
}
