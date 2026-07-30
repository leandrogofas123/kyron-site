import { colaboradorLogado, podeFazer } from "@/lib/erp/auth";
import { statusIntegracoes, ultimasChamadas } from "@/lib/integracoes/registro";

export const dynamic = "force-dynamic";

function quando(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default async function ErpIntegracoes() {
  const eu = await colaboradorLogado();
  if (!eu || !podeFazer(eu.papel, "financeiro")) {
    return (
      <div className="mx-auto max-w-[40rem] rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-lg text-center">
        <h1 className="kyron-display text-fluid-lg text-kyron-white">Acesso restrito</h1>
        <p className="mt-fluid-sm text-fluid-base text-kyron-silver">
          O painel de integrações é visível para administradores.
        </p>
      </div>
    );
  }

  const [integracoes, chamadas] = await Promise.all([
    statusIntegracoes(),
    ultimasChamadas(40),
  ]);

  return (
    <>
      <div className="mb-fluid-lg">
        <h1 className="kyron-display text-fluid-xl text-kyron-white">Integrações</h1>
        <p className="text-fluid-2xs text-kyron-silver/60">
          Serviços externos que a plataforma usa, se estão configurados e como
          estão respondendo. Só o que existe de verdade.
        </p>
      </div>

      <div className="mb-fluid-xl grid gap-fluid-sm sm:grid-cols-2 xl:grid-cols-3">
        {integracoes.map((i) => {
          const estado = !i.configurado
            ? { rotulo: "Não configurado", cor: "text-kyron-silver/50" }
            : i.id === "hubspot"
              ? { rotulo: "Suspenso", cor: "text-kyron-silver" }
              : i.falhas7d > 0 && i.falhas7d >= i.chamadas7d
                ? { rotulo: "Com falhas", cor: "text-kyron-blue" }
                : { rotulo: "Ativo", cor: "text-kyron-blue" };
          return (
            <div
              key={i.id}
              className="rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-md"
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-fluid-sm text-kyron-white">{i.nome}</p>
                <span className={`text-fluid-2xs ${estado.cor}`}>{estado.rotulo}</span>
              </div>
              <p className="text-fluid-2xs text-kyron-silver/50">
                {i.categoria} · {i.envVar}
              </p>
              {i.configurado && i.id !== "hubspot" && (
                <p className="mt-fluid-xs text-fluid-2xs text-kyron-silver/60">
                  {i.chamadas7d} chamada(s) / 7d
                  {i.falhas7d > 0 ? ` · ${i.falhas7d} falha(s)` : ""}
                  {i.latenciaMedia != null ? ` · ~${i.latenciaMedia}ms` : ""}
                  {i.ultimaChamada ? ` · última ${quando(i.ultimaChamada)}` : ""}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <h2 className="kyron-label mb-fluid-sm text-fluid-2xs text-kyron-silver/70">
        Últimas chamadas
      </h2>
      {chamadas.length === 0 ? (
        <p className="text-fluid-2xs text-kyron-silver/60">
          Nenhuma chamada externa registrada ainda. Conversas do assistente e
          e-mails aparecem aqui conforme acontecem.
        </p>
      ) : (
        <ul className="space-y-fluid-2xs">
          {chamadas.map((c) => {
            const erro = c.status === "erro";
            return (
              <li
                key={c.id}
                className={`flex flex-wrap items-baseline justify-between gap-2 rounded-kyron-sm border px-fluid-sm py-fluid-xs ${
                  erro ? "border-[var(--kyron-blue-line)]" : "border-[var(--kyron-hairline)]"
                }`}
              >
                <span className="text-fluid-sm text-kyron-white">
                  {c.provider}
                  <span className="text-fluid-2xs text-kyron-silver/50"> · {c.operacao}</span>
                </span>
                <span className={`text-fluid-2xs ${erro ? "text-kyron-blue" : "text-kyron-silver"}`}>
                  {erro ? "erro" : "ok"}
                  {c.latenciaMs != null ? ` · ${c.latenciaMs}ms` : ""} · {quando(c.criadoEm)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
