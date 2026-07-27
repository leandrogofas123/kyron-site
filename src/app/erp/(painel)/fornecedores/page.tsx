import { GerenciarFornecedores } from "@/components/erp/GerenciarFornecedores";
import { colaboradorLogado, podeFazer } from "@/lib/erp/auth";
import { listarFornecedores } from "@/lib/erp/produtos";

export const dynamic = "force-dynamic";

export default async function ErpFornecedores() {
  const [eu, fornecedores] = await Promise.all([
    colaboradorLogado(),
    listarFornecedores(),
  ]);
  const podeEditar = eu ? podeFazer(eu.papel, "fornecedores.editar") : false;

  return (
    <>
      <div className="mb-fluid-lg">
        <h1 className="kyron-display text-fluid-xl text-kyron-white">Fornecedores</h1>
        <p className="text-fluid-2xs text-kyron-silver/60">
          {fornecedores.length} cadastrado(s)
        </p>
      </div>

      <GerenciarFornecedores
        podeEditar={podeEditar}
        fornecedores={fornecedores.map((f) => ({
          id: f.id,
          nome: f.nome,
          cnpj: f.cnpj,
          contato: f.contato,
          telefone: f.telefone,
          email: f.email,
          cidade: f.cidade,
          estado: f.estado,
          observacoes: f.observacoes,
        }))}
      />
    </>
  );
}
