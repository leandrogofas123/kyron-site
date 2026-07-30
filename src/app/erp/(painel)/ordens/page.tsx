import Link from "next/link";

import { NovaOS } from "@/components/erp/NovaOS";
import { colaboradorLogado, podeFazer } from "@/lib/erp/auth";
import { formatarPreco } from "@/lib/format";
import { clientesParaOS, listarOS, rotuloStatusOS } from "@/lib/ordens/os";

export const dynamic = "force-dynamic";

function data(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(d);
}

const ENCERRADAS = new Set(["entregue", "cancelada"]);

export default async function ErpOrdens() {
  const eu = await colaboradorLogado();
  const pode = eu ? podeFazer(eu.papel, "estoque.movimentar") : false;
  if (!pode) {
    return (
      <div className="mx-auto max-w-[40rem] rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-lg text-center">
        <h1 className="kyron-display text-fluid-lg text-kyron-white">Acesso restrito</h1>
        <p className="mt-fluid-sm text-fluid-base text-kyron-silver">
          Você não tem permissão para ver as ordens de serviço.
        </p>
      </div>
    );
  }

  const [ordens, clientes] = await Promise.all([listarOS(), clientesParaOS()]);
  const abertas = ordens.filter((o) => !ENCERRADAS.has(o.status));
  const encerradas = ordens.filter((o) => ENCERRADAS.has(o.status));

  return (
    <>
      <div className="mb-fluid-lg">
        <h1 className="kyron-display text-fluid-xl text-kyron-white">
          Ordens de serviço
        </h1>
        <p className="text-fluid-2xs text-kyron-silver/60">
          Assistência técnica e instalação. {abertas.length} aberta(s).
        </p>
      </div>

      <NovaOS clientes={clientes} />

      <Secao titulo="Abertas" ordens={abertas} data={data} vazio="Nenhuma OS aberta." />
      {encerradas.length > 0 && (
        <div className="mt-fluid-xl">
          <Secao titulo="Encerradas" ordens={encerradas} data={data} vazio="" />
        </div>
      )}
    </>
  );
}

type Linha = {
  id: number;
  clienteNome: string;
  equipamento: string;
  status: string;
  valor: number | null;
  tecnicoNome: string | null;
  criadoEm: Date;
};

function Secao({
  titulo,
  ordens,
  data,
  vazio,
}: {
  titulo: string;
  ordens: Linha[];
  data: (d: Date) => string;
  vazio: string;
}) {
  return (
    <>
      <h2 className="kyron-label mb-fluid-sm text-fluid-2xs text-kyron-silver/70">
        {titulo}
      </h2>
      {ordens.length === 0 ? (
        <p className="text-fluid-2xs text-kyron-silver/60">{vazio}</p>
      ) : (
        <ul className="space-y-fluid-2xs">
          {ordens.map((o) => (
            <li key={o.id}>
              <Link
                href={`/erp/ordens/${o.id}`}
                className="flex flex-wrap items-baseline justify-between gap-2 rounded-kyron-sm border border-[var(--kyron-hairline)] px-fluid-sm py-fluid-xs transition-colors hover:border-[var(--kyron-hairline-strong)]"
              >
                <span className="min-w-0 truncate text-fluid-sm text-kyron-white">
                  OS #{o.id} · {o.equipamento}
                  <span className="text-fluid-2xs text-kyron-silver/50">
                    {" "}
                    · {o.clienteNome}
                    {o.tecnicoNome ? ` · ${o.tecnicoNome}` : ""}
                  </span>
                </span>
                <span className="shrink-0 text-fluid-2xs text-kyron-silver">
                  {o.valor != null ? `${formatarPreco(o.valor)} · ` : ""}
                  {rotuloStatusOS(o.status)} · {data(o.criadoEm)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
