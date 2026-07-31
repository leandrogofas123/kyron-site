import "server-only";

import { db } from "../db";

/**
 * Banners / publicidade do site (módulo SITE).
 *
 * As POSIÇÕES vivem no código (com o tamanho recomendado) — assim o admin sabe
 * exatamente qual arte enviar e tudo fica padronizado. Um banner é sempre um
 * item posicionado; vários na mesma posição viram carrossel.
 */

export type Posicao = {
  id: string;
  nome: string;
  desktop: { w: number; h: number };
  mobile: { w: number; h: number };
};

export const POSICOES: Posicao[] = [
  { id: "hero", nome: "Home — banner principal", desktop: { w: 1600, h: 600 }, mobile: { w: 800, h: 800 } },
  { id: "meio", nome: "Home — faixa promocional", desktop: { w: 1200, h: 250 }, mobile: { w: 720, h: 300 } },
  { id: "rodape", nome: "Home — rodapé", desktop: { w: 1200, h: 200 }, mobile: { w: 720, h: 240 } },
];

export function posicao(id: string): Posicao | undefined {
  return POSICOES.find((p) => p.id === id);
}

/** Todos os banners (para a administração no ERP). */
export function listarBanners() {
  return db.banner.findMany({ orderBy: [{ posicao: "asc" }, { ordem: "asc" }] });
}

export type BannerPublico = {
  id: number;
  titulo: string;
  imagemDesktop: string;
  imagemMobile: string | null;
  link: string | null;
  botaoTexto: string | null;
  rotacaoSegundos: number;
};

/** Banners visíveis de uma posição AGORA (ativo + dentro do período), ordenados. */
export async function bannersVisiveis(posicaoId: string): Promise<BannerPublico[]> {
  const agora = new Date();
  const linhas = await db.banner.findMany({
    where: {
      posicao: posicaoId,
      ativo: true,
      OR: [{ inicioEm: null }, { inicioEm: { lte: agora } }],
      AND: [{ OR: [{ fimEm: null }, { fimEm: { gte: agora } }] }],
    },
    orderBy: { ordem: "asc" },
    select: {
      id: true, titulo: true, imagemDesktop: true, imagemMobile: true,
      link: true, botaoTexto: true, rotacaoSegundos: true,
    },
  });
  return linhas;
}
