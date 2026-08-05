import { linhaEmail } from "../core/providers/mail";

/**
 * Templates nomeados (módulo Notification).
 *
 * Centraliza o texto das mensagens que antes vivia solto em cada lugar. Cada
 * template é uma função das variáveis e devolve assunto + HTML. Trocar o texto
 * de um e-mail passa a ser mexer AQUI, num lugar só.
 */

const ROTULO_INTERESSE: Record<string, string> = {
  apple: "Apple (novos)",
  seminovos: "iPhone seminovos",
  "casa-inteligente": "Casa inteligente / automação",
  "audio-acessorios": "Áudio e acessórios",
  "assistencia-tecnica": "Assistência técnica",
  "servico-instalacao": "Serviço / instalação",
  "nao-definido": "Não definido",
};

export type Vars = Record<string, string | null | undefined>;
export type Renderizado = { assunto: string; html: string; canal?: string };

const TEMPLATES: Record<string, (v: Vars) => Renderizado> = {
  "recuperar-senha": (v) => ({
    assunto: "Redefinir sua senha — Kyron",
    html: [
      "<p>Recebemos um pedido para redefinir sua senha.</p>",
      `<p><a href="${v.link}">Clique aqui para criar uma nova senha</a> (válido por 30 minutos).</p>`,
      "<p>Se não foi você, ignore este e-mail.</p>",
    ].join(""),
  }),

  "novo-lead": (v) => ({
    assunto: `Novo lead: ${v.nome ?? "sem nome"}`,
    html: [
      "<h2>Novo lead pelo site</h2>",
      linhaEmail("Nome", v.nome),
      linhaEmail("WhatsApp/telefone", v.telefone),
      linhaEmail("E-mail", v.email),
      linhaEmail("Interesse", v.interesse ? ROTULO_INTERESSE[v.interesse] ?? v.interesse : null),
      linhaEmail("Urgência", v.urgencia),
      linhaEmail("Perfil", v.perfil),
      linhaEmail("Necessidade", v.resumo),
      linhaEmail("Origem", v.origem),
    ]
      .filter(Boolean)
      .join(""),
  }),

  "novo-cliente": (v) => ({
    assunto: `Novo cadastro de cliente: ${v.nome ?? ""}`.trim(),
    html: [
      "<h2>Novo cliente aguardando aprovação</h2>",
      linhaEmail("Nome", v.nome),
      linhaEmail("E-mail", v.email),
      "<p>Aprove em /erp/alunos para liberar o acesso às aulas.</p>",
    ].join(""),
  }),
};

/** Renderiza um template; null se o id não existir. */
export function renderTemplate(id: string, vars: Vars): Renderizado | null {
  const fn = TEMPLATES[id];
  return fn ? fn(vars) : null;
}
