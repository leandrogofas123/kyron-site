import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/kyron/site";

/**
 * Indexação sob interruptor.
 *
 * Enquanto o catálogo é de exemplo e o site ainda não tem domínio próprio, ser
 * indexado é prejuízo: o Google registra a Kyron como loja de produtos
 * "(exemplo)" e essa URL passa a disputar relevância com o domínio definitivo
 * quando ele existir.
 *
 * Para liberar no dia do lançamento, definir NEXT_PUBLIC_ALLOW_INDEXING=true
 * nas variáveis do Railway — é um switch de ambiente, sem deploy de código.
 */
export default function robots(): MetadataRoute.Robots {
  const liberado = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

  if (!liberado) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Rotas de API não têm conteúdo indexável.
      disallow: "/api/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
