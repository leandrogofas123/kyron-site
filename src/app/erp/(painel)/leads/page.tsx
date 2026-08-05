import { QuadroLeads, type LeadKanban } from "@/components/erp/QuadroLeads";
import { colaboradorLogado, podeFazer } from "@/lib/erp/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function quando(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default async function ErpLeads() {
  const eu = await colaboradorLogado();
  if (!eu || !podeFazer(eu.papel, "clientes.ver")) {
    return (
      <div className="mx-auto max-w-[40rem] rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-lg text-center">
        <h1 className="kyron-display text-fluid-lg text-kyron-white">Acesso restrito</h1>
        <p className="mt-fluid-sm text-fluid-base text-kyron-silver">
          Os leads são visíveis para a equipe de vendas.
        </p>
      </div>
    );
  }

  const leads = await db.lead.findMany({ orderBy: { criadoEm: "desc" }, take: 300 });
  const novos = leads.filter((l) => l.status === "novo").length;

  const dados: LeadKanban[] = leads.map((l) => ({
    id: l.id,
    nome: l.nome,
    telefone: l.telefone,
    email: l.email,
    origem: l.origem,
    interesse: l.interesse,
    mensagem: l.mensagem,
    criadoEm: quando(l.criadoEm),
    status: l.status,
    score: l.score,
  }));

  return (
    <>
      <div className="mb-fluid-lg">
        <h1 className="kyron-display text-fluid-xl text-kyron-white">Leads · CRM</h1>
        <p className="text-fluid-2xs text-kyron-silver/60">
          {leads.length} no total · {novos} novos · arraste os cards entre as etapas
        </p>
      </div>

      {leads.length === 0 ? (
        <p className="text-fluid-sm text-kyron-silver">
          Nenhum lead ainda. Eles aparecem aqui quando alguém fala com o
          assistente ou pede um orçamento pelo site.
        </p>
      ) : (
        <QuadroLeads leads={dados} />
      )}
    </>
  );
}
