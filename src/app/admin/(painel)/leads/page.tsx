import { StatusLead } from "@/components/admin/StatusLead";
import { db } from "@/lib/db";
import { linkWhatsApp } from "@/lib/kyron/site";

export const dynamic = "force-dynamic";

const ORIGEM: Record<string, string> = {
  produto: "Produto",
  servico: "Serviço",
  geral: "Geral",
};

function quando(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default async function AdminLeads() {
  const leads = await db.lead.findMany({ orderBy: { criadoEm: "desc" }, take: 200 });
  const novos = leads.filter((l) => l.status === "novo").length;

  return (
    <>
      <div className="mb-fluid-lg">
        <h1 className="kyron-display text-fluid-xl text-kyron-white">Leads</h1>
        <p className="text-fluid-2xs text-kyron-silver/60">
          {leads.length} no total · {novos} novos
        </p>
      </div>

      {leads.length === 0 ? (
        <p className="text-fluid-sm text-kyron-silver">
          Nenhum lead ainda. Eles aparecem aqui quando alguém pede orçamento pelo site.
        </p>
      ) : (
        <ul className="space-y-fluid-sm">
          {leads.map((l) => {
            const whats = linkWhatsApp(`Olá ${l.nome}, aqui é da Kyron. Recebemos seu contato pelo site.`);
            const numero = l.telefone.replace(/\D/g, "");
            const linkTel = numero.length >= 10 ? `https://wa.me/55${numero.replace(/^55/, "")}` : whats;

            return (
              <li key={l.id} className="rounded-kyron-md border border-[var(--kyron-hairline)] p-fluid-sm">
                <div className="flex flex-wrap items-start justify-between gap-fluid-sm">
                  <div className="min-w-0">
                    <p className="text-fluid-sm font-semibold text-kyron-white">{l.nome}</p>
                    <p className="text-fluid-2xs text-kyron-silver/60">
                      {ORIGEM[l.origem] ?? l.origem} · {quando(l.criadoEm)}
                    </p>
                  </div>
                  <StatusLead id={l.id} status={l.status} />
                </div>

                {l.mensagem && (
                  <p className="mt-fluid-xs text-fluid-sm text-kyron-silver">{l.mensagem}</p>
                )}

                <div className="mt-fluid-sm flex flex-wrap gap-fluid-sm text-fluid-2xs">
                  {linkTel && (
                    <a
                      href={linkTel}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-kyron-blue hover:underline"
                    >
                      {l.telefone} · abrir no WhatsApp
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
