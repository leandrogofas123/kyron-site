import Link from "next/link";

import { listarAuditoria } from "@/lib/core/audit";
import { colaboradorLogado } from "@/lib/erp/auth";

export const dynamic = "force-dynamic";

const ROTULO_ACAO: Record<string, string> = {
  login: "Entrou no sistema",
  "login-negado": "Tentativa de login negada",
  "conceder-acesso": "Concedeu acesso",
  "revogar-acesso": "Revogou acesso",
  "reativar-acesso": "Reativou acesso",
  "alterar-papel": "Alterou o perfil",
  "redefinir-senha": "Redefiniu a senha",
  "aprovar-cliente": "Aprovou cliente das aulas",
  "revogar-cliente": "Revogou cliente das aulas",
};

function quando(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/** Mostra só o que mudou, em texto curto. */
function resumoMudanca(antes: string | null, depois: string | null): string | null {
  try {
    const a = antes ? (JSON.parse(antes) as Record<string, unknown>) : null;
    const d = depois ? (JSON.parse(depois) as Record<string, unknown>) : null;
    if (!d) return null;
    return Object.keys(d)
      .map((k) => {
        const de = a?.[k];
        return de !== undefined
          ? `${k}: ${String(de)} → ${String(d[k])}`
          : `${k}: ${String(d[k])}`;
      })
      .join(" · ");
  } catch {
    return null;
  }
}

export default async function ErpAuditoria({
  searchParams,
}: {
  searchParams: Promise<{ modulo?: string }>;
}) {
  const eu = await colaboradorLogado();

  // Trilha de auditoria é informação sensível: só o admin master enxerga.
  if (!eu || eu.papel !== "admin") {
    return (
      <div className="mx-auto max-w-[40rem] rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-lg text-center">
        <h1 className="kyron-display text-fluid-lg text-kyron-white">
          Acesso restrito
        </h1>
        <p className="mt-fluid-sm text-fluid-base text-kyron-silver">
          Apenas o administrador master pode consultar a auditoria.
        </p>
      </div>
    );
  }

  const { modulo } = await searchParams;
  const registros = await listarAuditoria({ modulo, limite: 200 });

  const filtros = [
    { id: undefined, label: "Tudo" },
    { id: "erp", label: "ERP" },
    { id: "admin", label: "Admin" },
    { id: "auth", label: "Acessos" },
  ];

  return (
    <>
      <div className="mb-fluid-md">
        <h1 className="kyron-display text-fluid-xl text-kyron-white">Auditoria</h1>
        <p className="text-fluid-2xs text-kyron-silver/60">
          Quem fez o quê, quando e de onde. Registros nunca são apagados.
        </p>
      </div>

      <div className="mb-fluid-lg flex flex-wrap gap-fluid-xs">
        {filtros.map((f) => {
          const ativo = modulo === f.id || (!modulo && !f.id);
          return (
            <Link
              key={f.label}
              href={f.id ? `/erp/auditoria?modulo=${f.id}` : "/erp/auditoria"}
              className={`kyron-label rounded-kyron-sm border px-fluid-sm py-fluid-2xs text-fluid-2xs transition-colors ${
                ativo
                  ? "border-[var(--kyron-blue-line)] text-kyron-blue"
                  : "border-[var(--kyron-hairline-strong)] text-kyron-silver hover:text-kyron-white"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {registros.length === 0 ? (
        <p className="text-fluid-sm text-kyron-silver/60">
          Nenhum registro ainda. Ações sensíveis (acessos, aprovações, logins)
          passam a aparecer aqui conforme acontecem.
        </p>
      ) : (
        <ul className="space-y-fluid-2xs">
          {registros.map((r) => {
            const mudanca = resumoMudanca(r.valorAntes, r.valorDepois);
            const negado = r.acao === "login-negado";
            return (
              <li
                key={r.id}
                className={`rounded-kyron-sm border px-fluid-sm py-fluid-xs ${
                  negado
                    ? "border-[var(--kyron-blue-line)]"
                    : "border-[var(--kyron-hairline)]"
                }`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-fluid-sm text-kyron-white">
                    {ROTULO_ACAO[r.acao] ?? r.acao}
                    {r.entidade ? (
                      <span className="text-fluid-2xs text-kyron-silver/60">
                        {" "}
                        · {r.entidade}
                        {r.entidadeId ? ` #${r.entidadeId}` : ""}
                      </span>
                    ) : null}
                  </span>
                  <span className="shrink-0 text-fluid-2xs text-kyron-silver">
                    {quando(r.criadoEm)}
                  </span>
                </div>
                <p className="text-fluid-2xs text-kyron-silver/60">
                  {r.atorNome ?? r.atorTipo}
                  {r.ip ? ` · ${r.ip}` : ""}
                  {r.modulo ? ` · ${r.modulo}` : ""}
                </p>
                {mudanca && (
                  <p className="mt-0.5 text-fluid-2xs text-kyron-silver">{mudanca}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
