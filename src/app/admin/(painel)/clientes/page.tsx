import { AcoesCliente } from "@/components/admin/AcoesCliente";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminClientes() {
  const usuarios = await db.usuario.findMany({
    orderBy: [{ aprovado: "asc" }, { criadoEm: "desc" }],
  });
  const pendentes = usuarios.filter((u) => !u.aprovado).length;

  return (
    <div>
      <h1 className="kyron-display mb-fluid-xs text-fluid-xl text-kyron-white">
        Clientes · acesso às aulas
      </h1>
      <p className="mb-fluid-md text-fluid-sm text-kyron-silver">
        {usuarios.length} cadastro(s)
        {pendentes > 0 && ` · ${pendentes} aguardando aprovação`}.
      </p>

      {usuarios.length === 0 ? (
        <p className="text-fluid-sm text-kyron-silver">
          Nenhum cliente cadastrado ainda.
        </p>
      ) : (
        <ul className="space-y-fluid-xs">
          {usuarios.map((u) => (
            <li
              key={u.id}
              className={`flex flex-wrap items-center justify-between gap-fluid-sm rounded-kyron-md border p-fluid-sm ${
                u.aprovado
                  ? "border-[var(--kyron-hairline)]"
                  : "border-[var(--kyron-blue-line)]"
              }`}
            >
              <div className="min-w-0">
                <p className="truncate text-fluid-sm font-semibold text-kyron-white">
                  {u.nome}{" "}
                  {u.aprovado ? (
                    <span className="kyron-label ml-1 text-fluid-2xs text-kyron-blue">
                      aprovado
                    </span>
                  ) : (
                    <span className="kyron-label ml-1 text-fluid-2xs text-kyron-silver/60">
                      pendente
                    </span>
                  )}
                </p>
                <p className="truncate text-fluid-2xs text-kyron-silver/60">
                  {u.email}
                </p>
              </div>
              <AcoesCliente id={u.id} aprovado={u.aprovado} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
