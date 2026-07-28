/**
 * Log estruturado.
 *
 * PROBLEMA QUE RESOLVE
 * O código já registra erros com `console.error("[kyron:escopo]", ...)`, o que é
 * uma convenção boa — mas sai como texto solto. O coletor do Railway não
 * consegue filtrar por escopo, nem agrupar ocorrências, nem responder "quantas
 * falhas de HubSpot houve hoje". Em produção, log que não dá para consultar é
 * quase o mesmo que log nenhum.
 *
 * Emitindo UMA linha de JSON por evento, cada campo vira filtrável no painel.
 *
 * LGPD
 * Lead carrega nome, telefone e e-mail. Jogar isso no log cria uma segunda base
 * de dados pessoais fora do banco, sem controle de retenção. Por isso todo
 * objeto passa por `redigir()` antes de ser serializado: campos sensíveis viram
 * máscara, preservando o que serve para diagnóstico (o domínio do e-mail, os
 * últimos dígitos do telefone) e descartando o que identifica a pessoa.
 *
 * Sem dependência externa de propósito: o contrato é pequeno e `pino`/`winston`
 * trariam peso e incompatibilidade com o runtime Edge do middleware.
 */

type Nivel = "debug" | "info" | "warn" | "error";

/**
 * Normaliza o nome do campo antes de comparar.
 *
 * Sem isto, `ADMIN_SECRET` escapa da lista porque vira `admin_secret` e não
 * bate com `adminsecret`. Removendo sublinhado e hífen, as três grafias usuais
 * (`adminSecret`, `admin_secret`, `ADMIN-SECRET`) colidem no mesmo termo.
 */
function normalizarChave(chave: string): string {
  return chave.toLowerCase().replace(/[_-]/g, "");
}

/**
 * Termos que, se aparecerem em QUALQUER parte do nome do campo, ocultam o valor.
 *
 * A checagem é por conteúdo, e não por igualdade, de propósito: campo novo como
 * `hubspotToken` ou `resendApiKey` passa a ser protegido sozinho, sem ninguém
 * lembrar de vir aqui atualizar a lista. Em log, errar para o lado de ocultar
 * demais é barato; vazar segredo, não.
 */
const TERMOS_SIGILOSOS = [
  "senha",
  "password",
  "token",
  "authorization",
  "cookie",
  "secret",
  "apikey",
  "credential",
  "autorizacao",
];

/** Campos que são dado pessoal: viram máscara parcial, não somem. */
const CAMPOS_PESSOAIS = new Set(["email", "telefone", "cpf", "cnpj", "nome"]);

function ehSigiloso(chaveNormalizada: string): boolean {
  return TERMOS_SIGILOSOS.some((termo) => chaveNormalizada.includes(termo));
}

function mascarar(chave: string, valor: string): string {
  if (chave === "email") {
    const [, dominio] = valor.split("@");
    return dominio ? `***@${dominio}` : "***";
  }
  if (chave === "telefone") {
    const digitos = valor.replace(/\D/g, "");
    return digitos.length >= 4 ? `***${digitos.slice(-4)}` : "***";
  }
  if (chave === "nome") {
    const primeiro = valor.trim().split(/\s+/)[0] ?? "";
    return primeiro ? `${primeiro} ***` : "***";
  }
  // CPF/CNPJ: nunca são úteis em log.
  return "***";
}

/**
 * Redige um valor antes de serializar.
 *
 * `vistos` evita laço infinito em objeto com referência circular — o Prisma
 * devolve grafos com relação de volta (produto -> categoria -> produtos).
 */
function redigir(valor: unknown, vistos = new WeakSet<object>()): unknown {
  if (valor === null || typeof valor !== "object") return valor;
  if (valor instanceof Date) return valor.toISOString();
  if (valor instanceof Error) {
    return { nome: valor.name, mensagem: valor.message, pilha: valor.stack };
  }
  if (vistos.has(valor)) return "[circular]";
  vistos.add(valor);

  if (Array.isArray(valor)) return valor.map((item) => redigir(item, vistos));

  const saida: Record<string, unknown> = {};
  for (const [chave, item] of Object.entries(valor)) {
    const normalizada = normalizarChave(chave);
    if (ehSigiloso(normalizada)) {
      saida[chave] = "[oculto]";
    } else if (CAMPOS_PESSOAIS.has(normalizada) && typeof item === "string") {
      saida[chave] = mascarar(normalizada, item);
    } else {
      saida[chave] = redigir(item, vistos);
    }
  }
  return saida;
}

const ehProducao = process.env.NODE_ENV === "production";

function emitir(
  nivel: Nivel,
  escopo: string,
  mensagem: string,
  dados?: Record<string, unknown>,
) {
  // Em desenvolvimento, linha legível: JSON de uma linha atrapalha quem está
  // com o terminal aberto ao lado do editor.
  if (!ehProducao) {
    const extra = dados ? redigir(dados) : undefined;
    const escrever = nivel === "error" ? console.error : console.log;
    escrever(`[kyron:${escopo}] ${mensagem}`, extra ?? "");
    return;
  }

  const linha = {
    nivel,
    escopo,
    mensagem,
    momento: new Date().toISOString(),
    ...(dados ? { dados: redigir(dados) } : {}),
  };

  // stdout para tudo, menos erro — mantém o fluxo de erro separado no coletor.
  const escrever = nivel === "error" ? console.error : console.log;
  escrever(JSON.stringify(linha));
}

/**
 * Cria um logger amarrado a um escopo.
 *
 * @example
 * const log = criarLog("hubspot");
 * log.erro("falha ao criar contato", { status: 500 });
 */
export function criarLog(escopo: string) {
  return {
    debug: (msg: string, dados?: Record<string, unknown>) =>
      emitir("debug", escopo, msg, dados),
    info: (msg: string, dados?: Record<string, unknown>) =>
      emitir("info", escopo, msg, dados),
    aviso: (msg: string, dados?: Record<string, unknown>) =>
      emitir("warn", escopo, msg, dados),
    erro: (msg: string, dados?: Record<string, unknown>) =>
      emitir("error", escopo, msg, dados),
  };
}

export type Log = ReturnType<typeof criarLog>;
