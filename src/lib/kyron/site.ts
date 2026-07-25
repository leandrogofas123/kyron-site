import { formatarPreco } from "@/lib/format";

import { KYRON_COMPANY } from "./company";

/**
 * Navegação e conversão do catálogo Kyron.
 *
 * Decisão da spec (seção 1): a conversão acontece no WhatsApp. Todo CTA leva
 * para wa.me com mensagem pré-preenchida e qualificada — a conversa já chega
 * dizendo qual produto ou serviço, sem o vendedor precisar perguntar.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://kyroncompany.com";

export const NAV_PRINCIPAL = [
  { label: "Início", href: "/" },
  { label: "Produtos", href: "/produtos" },
  { label: "Seminovos", href: "/seminovos" },
  { label: "Serviços", href: "/servicos" },
  { label: "Sobre", href: "/sobre" },
  { label: "Contato", href: "/contato" },
] as const;

export const CONTATO = {
  email: KYRON_COMPANY.email,
  whatsapp: KYRON_COMPANY.whatsapp,
} as const;

/** Só dígitos, com DDI. Aceita o número em qualquer formato e normaliza. */
function numeroWhatsApp(): string | null {
  if (!CONTATO.whatsapp) return null;
  const numero = CONTATO.whatsapp.replace(/\D/g, "");
  return numero.length >= 12 ? numero : null;
}

function montarLink(mensagem?: string): string | null {
  const numero = numeroWhatsApp();
  if (!numero) return null;
  const base = `https://wa.me/${numero}`;
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base;
}

/** Link genérico do WhatsApp (rodapé, contato). */
export function linkWhatsApp(mensagem?: string): string | null {
  return montarLink(mensagem);
}

/** WhatsApp qualificado por produto — a conversa chega já identificando o item. */
export function linkWhatsAppProduto(produto: {
  nome: string;
  preco: number;
  precoPromo?: number | null;
}): string | null {
  const centavos = produto.precoPromo ?? produto.preco;
  const texto = `Olá! Vi o ${produto.nome} no site — ${formatarPreco(centavos)}. Ainda tem?`;
  return montarLink(texto);
}

/** WhatsApp qualificado por serviço. */
export function linkWhatsAppServico(servico: { nome: string }): string | null {
  const texto = `Olá! Tenho interesse no serviço de ${servico.nome}. Pode me passar um orçamento?`;
  return montarLink(texto);
}

/** CTA primário do site: falar no WhatsApp. */
export const CTA_PRIMARIO = {
  label: "Falar no WhatsApp",
  href: montarLink("Olá! Vim pelo site da Kyron e gostaria de mais informações.") ?? "/contato",
} as const;
