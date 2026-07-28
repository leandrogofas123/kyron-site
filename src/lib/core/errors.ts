/**
 * Erros da plataforma (core).
 *
 * Um erro do domínio carrega: mensagem SEGURA para o usuário, um código
 * estável para o log e o status HTTP. Assim as camadas de cima decidem o que
 * mostrar sem vazar detalhe interno — e o log continua tendo o detalhe.
 *
 * Uso:
 *   throw new NaoAutorizadoError();
 *   throw new ValidacaoError("Informe o preço de venda.");
 */

export class AppError extends Error {
  readonly codigo: string;
  readonly status: number;
  /** Seguro para exibir ao usuário final. */
  readonly publico: boolean;
  readonly detalhes?: unknown;

  constructor(
    mensagem: string,
    opcoes: {
      codigo?: string;
      status?: number;
      publico?: boolean;
      detalhes?: unknown;
      causa?: unknown;
    } = {},
  ) {
    super(mensagem, { cause: opcoes.causa });
    this.name = new.target.name;
    this.codigo = opcoes.codigo ?? "ERRO_APP";
    this.status = opcoes.status ?? 500;
    this.publico = opcoes.publico ?? false;
    this.detalhes = opcoes.detalhes;
  }
}

export class ValidacaoError extends AppError {
  constructor(mensagem: string, detalhes?: unknown) {
    super(mensagem, { codigo: "VALIDACAO", status: 400, publico: true, detalhes });
  }
}

export class NaoAutorizadoError extends AppError {
  constructor(mensagem = "Não autorizado.") {
    super(mensagem, { codigo: "NAO_AUTORIZADO", status: 401, publico: true });
  }
}

export class ProibidoError extends AppError {
  constructor(mensagem = "Sem permissão para esta ação.") {
    super(mensagem, { codigo: "PROIBIDO", status: 403, publico: true });
  }
}

export class NaoEncontradoError extends AppError {
  constructor(mensagem = "Registro não encontrado.") {
    super(mensagem, { codigo: "NAO_ENCONTRADO", status: 404, publico: true });
  }
}

export class LimiteExcedidoError extends AppError {
  constructor(mensagem = "Muitas requisições. Aguarde alguns instantes.") {
    super(mensagem, { codigo: "LIMITE", status: 429, publico: true });
  }
}

/**
 * Mensagem segura para o usuário: erro do domínio marcado como público mostra
 * sua mensagem; qualquer outro vira um texto genérico (não vaza stack, SQL,
 * caminho de arquivo nem nome de coluna).
 */
export function mensagemSegura(
  erro: unknown,
  padrao = "Não foi possível concluir. Tente novamente.",
): string {
  if (erro instanceof AppError && erro.publico) return erro.message;
  return padrao;
}
