import { colaboradorLogado, podeFazer } from "@/lib/erp/auth";
import { listarNotificacoes } from "@/lib/notificacao/servico";

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

const ROTULO_TEMPLATE: Record<string, string> = {
  "novo-lead": "Novo lead",
  "novo-cliente": "Novo cliente",
  "recuperar-senha": "Recuperação de senha",
};

const ROTULO_STATUS: Record<string, string> = {
  enviado: "Enviado",
  falhou: "Falhou",
  pendente: "Pendente",
};

export default async function ErpNotificacoes() {
  const eu = await colaboradorLogado();
  if (!eu || !podeFazer(eu.papel, "clientes.ver")) {
    return (
      <div className="mx-auto max-w-[40rem] rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-lg text-center">
        <h1 className="kyron-display text-fluid-lg text-kyron-white">Acesso restrito</h1>
        <p className="mt-fluid-sm text-fluid-base text-kyron-silver">
          Você não tem permissão para ver o histórico de comunicação.
        </p>
      </div>
    );
  }

  const notificacoes = await listarNotificacoes(200);

  return (
    <>
      <div className="mb-fluid-lg">
        <h1 className="kyron-display text-fluid-xl text-kyron-white">Notificações</h1>
        <p className="text-fluid-2xs text-kyron-silver/60">
          Histórico de tudo que a plataforma enviou — para quem, por qual canal e
          se chegou. Toda comunicação passa por aqui.
        </p>
      </div>

      {notificacoes.length === 0 ? (
        <p className="text-fluid-sm text-kyron-silver/60">
          Nada enviado ainda. E-mails de leads, cadastros e recuperação de senha
          aparecem aqui conforme acontecem.
        </p>
      ) : (
        <ul className="space-y-fluid-2xs">
          {notificacoes.map((n) => {
            const falhou = n.status === "falhou";
            return (
              <li
                key={n.id}
                className={`rounded-kyron-sm border px-fluid-sm py-fluid-xs ${
                  falhou
                    ? "border-[var(--kyron-blue-line)]"
                    : "border-[var(--kyron-hairline)]"
                }`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-fluid-sm text-kyron-white">
                    {n.assunto ?? ROTULO_TEMPLATE[n.template ?? ""] ?? "Mensagem"}
                    <span className="text-fluid-2xs text-kyron-silver/50">
                      {" "}
                      · {n.canal}
                      {n.template ? ` · ${ROTULO_TEMPLATE[n.template] ?? n.template}` : ""}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 text-fluid-2xs ${
                      falhou ? "text-kyron-blue" : "text-kyron-silver"
                    }`}
                  >
                    {ROTULO_STATUS[n.status] ?? n.status} · {quando(n.criadoEm)}
                  </span>
                </div>
                <p className="text-fluid-2xs text-kyron-silver/60">
                  {n.destinatario}
                  {n.provider ? ` · ${n.provider}` : ""}
                  {falhou && n.erro ? ` · ${n.erro}` : ""}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
