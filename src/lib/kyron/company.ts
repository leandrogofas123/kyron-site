/**
 * DADOS OFICIAIS DA EMPRESA
 *
 * Fonte de verdade única para rodapé, textos legais (Política de Privacidade,
 * Termos de Uso) e schema markup.
 *
 * Confirmado pelo cartão CNPJ em 23/07/2026:
 *  - Razão social: LEANDRO MIGUEL GOFAS DIAS (empresário individual)
 *  - Nome fantasia: KYRON TECNOLOGIA
 *  - CNPJ: 68.051.031/0001-05
 *
 * Endereço confirmado pelo cartão CNPJ em 23/07/2026. É um apartamento —
 * provavelmente residencial. Por isso há dois campos:
 *  - enderecoCompleto: uso interno / legal / nota fiscal (nunca exibido no site)
 *  - enderecoPublico: o que o site pode mostrar. Comece só com cidade/UF e
 *    deixe o cliente decidir se quer expor o endereço completo.
 *
 * Ainda PENDENTE (não preencher com suposição):
 *  - Telefone / WhatsApp comercial
 *  - E-mail comercial oficial
 */
export const KYRON_COMPANY = {
  nomeFantasia: "Kyron Tecnologia",
  razaoSocial: "Leandro Miguel Gofas Dias",
  cnpj: "68.051.031/0001-05",

  enderecoCompleto:
    "R. Vinte e Oito de Setembro, 502, Apt 1107, Centro, Santa Cruz do Sul - RS, CEP 96.810-174",
  // O que aparece publicamente no rodapé. Cidade/UF por padrão — trocar por
  // enderecoCompleto só se o cliente autorizar expor o endereço residencial.
  enderecoPublico: "Santa Cruz do Sul - RS",

  // Canal de contato principal, confirmado pelo cliente em 23/07/2026.
  email: "comercial@kyroncompany.com",

  // WhatsApp Business, confirmado pelo cliente em 24/07/2026.
  // Formato wa.me: DDI (55) + DDD (51) + número, só dígitos.
  whatsapp: process.env.NEXT_PUBLIC_KYRON_WHATSAPP ?? "5551982148520",

  // Preencher quando confirmado. Enquanto for null, o rodapé e o robô
  // omitem o campo em vez de mostrar um placeholder.
  telefone: null as string | null,
} as const;
