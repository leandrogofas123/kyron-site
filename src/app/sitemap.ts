import type { MetadataRoute } from "next";

import { getProdutos, getServicos } from "@/lib/catalogo";
import { SITE_URL } from "@/lib/kyron/site";

// Reconsulta o catálogo a cada hora — produtos novos entram no sitemap sozinhos.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const agora = new Date();

  const fixas: { url: string; priority: number; freq: "daily" | "weekly" | "monthly" }[] = [
    { url: "/", priority: 1, freq: "daily" },
    { url: "/produtos", priority: 0.9, freq: "daily" },
    { url: "/seminovos", priority: 0.9, freq: "daily" },
    { url: "/servicos", priority: 0.8, freq: "weekly" },
    { url: "/sobre", priority: 0.5, freq: "monthly" },
    { url: "/contato", priority: 0.7, freq: "monthly" },
    { url: "/orcamento", priority: 0.7, freq: "monthly" },
    { url: "/politica-de-privacidade", priority: 0.2, freq: "monthly" },
    { url: "/termos-de-uso", priority: 0.2, freq: "monthly" },
  ];

  const itens: MetadataRoute.Sitemap = fixas.map((p) => ({
    url: `${SITE_URL}${p.url}`,
    lastModified: agora,
    changeFrequency: p.freq,
    priority: p.priority,
  }));

  try {
    const { produtos } = await getProdutos();
    for (const p of produtos) {
      itens.push({
        url: `${SITE_URL}/produtos/${p.slug}`,
        lastModified: p.atualizadoEm,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }

    const servicos = await getServicos();
    for (const s of servicos) {
      itens.push({
        url: `${SITE_URL}/servicos/${s.slug}`,
        lastModified: agora,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  } catch {
    // Banco indisponível no build: entrega ao menos as páginas fixas.
  }

  return itens;
}
