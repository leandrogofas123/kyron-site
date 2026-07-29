import { QuadroLeads, type LeadKanban } from "@/components/admin/QuadroLeads";
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

export default async function AdminLeads() {
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
