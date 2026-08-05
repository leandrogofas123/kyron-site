import { ListaAlunos } from "@/components/erp/ListaAlunos";
import { colaboradorLogado, podeFazer } from "@/lib/erp/auth";
import { listarAlunos } from "@/lib/erp/alunos";

export const dynamic = "force-dynamic";

export default async function ErpAlunos() {
  const eu = await colaboradorLogado();
  if (!eu || !podeFazer(eu.papel, "alunos")) {
    return (
      <div className="mx-auto max-w-[40rem] rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-lg text-center">
        <h1 className="kyron-display text-fluid-lg text-kyron-white">Acesso restrito</h1>
        <p className="mt-fluid-sm text-fluid-base text-kyron-silver">
          A gestão de alunos é visível para administradores e gerentes.
        </p>
      </div>
    );
  }

  const alunos = await listarAlunos();
  const pendentes = alunos.filter((a) => !a.aprovado).length;

  return (
    <>
      <div className="mb-fluid-lg">
        <h1 className="kyron-display text-fluid-xl text-kyron-white">Alunos</h1>
        <p className="text-fluid-2xs text-kyron-silver/60">
          Clientes das aulas do Manual de Instalação. {alunos.length} cadastro(s)
          {pendentes > 0 && (
            <> · <span className="text-kyron-blue">{pendentes} aguardando aprovação</span></>
          )}
          . Aprovar libera as aulas restritas.
        </p>
      </div>

      <ListaAlunos alunos={alunos} />
    </>
  );
}
