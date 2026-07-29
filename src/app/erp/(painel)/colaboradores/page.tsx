import { GerenciarColaboradores } from "@/components/erp/GerenciarColaboradores";
import { db } from "@/lib/db";
import {
  CHAVES_EQUIPE,
  colaboradorLogado,
  papelErpDaLista,
} from "@/lib/erp/auth";

export const dynamic = "force-dynamic";

/**
 * Painel de acessos — exclusivo do admin master.
 * Só quem tem papel "admin" enxerga e altera quem entra no sistema.
 */
export default async function ErpColaboradores() {
  const eu = await colaboradorLogado();

  if (!eu || eu.papel !== "admin") {
    return (
      <div className="mx-auto max-w-[40rem] rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-lg text-center">
        <h1 className="kyron-display text-fluid-lg text-kyron-white">
          Acesso restrito
        </h1>
        <p className="mt-fluid-sm text-fluid-base text-kyron-silver">
          Apenas o administrador master pode gerenciar os acessos ao sistema.
        </p>
      </div>
    );
  }

  // Só a EQUIPE (quem tem papel de acesso ao sistema) — clientes das aulas não
  // aparecem aqui.
  const equipe = await db.usuario.findMany({
    where: { papeis: { some: { papel: { chave: { in: CHAVES_EQUIPE } } } } },
    orderBy: [{ ativo: "desc" }, { criadoEm: "asc" }],
    select: {
      id: true,
      nome: true,
      email: true,
      ativo: true,
      criadoEm: true,
      papeis: { select: { papel: { select: { chave: true } } } },
    },
  });
  const colaboradores = equipe.map((u) => ({
    id: u.id,
    nome: u.nome,
    email: u.email,
    ativo: u.ativo,
    criadoEm: u.criadoEm,
    papel: papelErpDaLista(u.papeis.map((p) => p.papel.chave)) ?? "vendedor",
  }));

  return (
    <>
      <div className="mb-fluid-lg">
        <h1 className="kyron-display text-fluid-xl text-kyron-white">
          Acessos ao sistema
        </h1>
        <p className="text-fluid-2xs text-kyron-silver/60">
          {colaboradores.length} pessoa(s) · só você, como administrador master,
          concede ou revoga acesso.
        </p>
      </div>

      <GerenciarColaboradores
        meuId={eu.id}
        colaboradores={colaboradores.map((c) => ({
          ...c,
          criadoEm: new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }).format(c.criadoEm),
        }))}
      />
    </>
  );
}
