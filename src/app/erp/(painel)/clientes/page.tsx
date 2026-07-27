import { GerenciarClientes } from "@/components/erp/GerenciarClientes";
import { listarClientes } from "@/lib/erp/clientes";
import { colaboradorLogado, podeFazer } from "@/lib/erp/auth";

export const dynamic = "force-dynamic";

export default async function ErpClientes({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const [eu, clientes] = await Promise.all([colaboradorLogado(), listarClientes(q)]);
  const podeEditar = eu ? podeFazer(eu.papel, "clientes.editar") : false;

  return (
    <>
      <div className="mb-fluid-md">
        <h1 className="kyron-display text-fluid-xl text-kyron-white">Clientes</h1>
        <p className="text-fluid-2xs text-kyron-silver/60">
          {clientes.length} cadastrado(s)
        </p>
      </div>

      <form action="/erp/clientes" className="mb-fluid-lg flex flex-wrap gap-fluid-xs">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por nome, telefone, e-mail, CPF ou cidade…"
          className="min-w-0 flex-1 rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-black px-fluid-sm py-fluid-xs text-fluid-sm text-kyron-white placeholder:text-kyron-silver/45 focus:border-[var(--kyron-blue-line)] focus:outline-none"
        />
        <button
          type="submit"
          className="kyron-label rounded-kyron-sm border border-[var(--kyron-hairline-strong)] px-fluid-md text-fluid-2xs text-kyron-white"
        >
          Buscar
        </button>
      </form>

      <GerenciarClientes
        podeEditar={podeEditar}
        clientes={clientes.map((c) => ({
          id: c.id,
          nome: c.nome,
          telefone: c.telefone,
          email: c.email,
          cpf: c.cpf,
          cidade: c.cidade,
          observacoes: c.observacoes,
        }))}
      />
    </>
  );
}
