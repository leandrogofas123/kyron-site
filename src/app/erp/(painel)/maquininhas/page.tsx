import { GerenciarMaquininhas } from "@/components/erp/GerenciarMaquininhas";
import { colaboradorLogado, podeFazer } from "@/lib/erp/auth";
import { bancosAtivos } from "@/lib/financeiro/bancos";
import { listarMaquininhas } from "@/lib/pdv/maquininhas";

export const dynamic = "force-dynamic";

export default async function ErpMaquininhas() {
  const eu = await colaboradorLogado();
  if (!eu || !podeFazer(eu.papel, "financeiro")) {
    return (
      <div className="mx-auto max-w-[40rem] rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-lg text-center">
        <h1 className="kyron-display text-fluid-lg text-kyron-white">Acesso restrito</h1>
        <p className="mt-fluid-sm text-fluid-base text-kyron-silver">
          As taxas de maquininha são configuráveis por administradores.
        </p>
      </div>
    );
  }

  const [maquininhas, bancos] = await Promise.all([listarMaquininhas(), bancosAtivos()]);

  return (
    <>
      <div className="mb-fluid-lg">
        <h1 className="kyron-display text-fluid-xl text-kyron-white">Maquininhas & taxas</h1>
        <p className="text-fluid-2xs text-kyron-silver/60">
          Cadastre as taxas reais do seu contrato e o banco/prazo de liquidação. No
          PDV, o líquido é descontado automático e a venda no cartão entra como “a
          receber” no banco certo, vencendo em D+prazo.
        </p>
      </div>

      <GerenciarMaquininhas maquininhas={maquininhas} bancos={bancos.map((b) => ({ id: b.id, nome: b.nome }))} />
    </>
  );
}
