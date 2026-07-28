import type { MetadataRoute } from "next";

/*
 * Web app manifest — nome, cor e ícone quando o site é "adicionado à tela
 * inicial" no celular. Fecha o aviso de PWA do Lighthouse e melhora a cara do
 * atalho no telefone do cliente.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kyron Tecnologia",
    short_name: "Kyron",
    description:
      "Apple novos e seminovos, casa inteligente, áudio e serviços de instalação em Santa Cruz do Sul.",
    start_url: "/",
    display: "standalone",
    background_color: "#060709",
    theme_color: "#060709",
    /*
     * Dois propósitos, e os dois são necessários.
     *
     * `any`      — o ícone como ele é, onde o sistema não recorta.
     * `maskable` — o Android recorta o atalho na forma do launcher (círculo,
     *   squircle, gota). Sem uma variante declarada como maskable, ele aplica o
     *   recorte no ícone comum e come as bordas do símbolo; e como o PNG da
     *   marca tem fundo transparente, sobraria o quadrado branco do sistema
     *   atrás do logo. Por isso a variante maskable tem fundo sólido #060709 e
     *   o símbolo reduzido a 60% do lado, dentro da zona segura do recorte.
     *
     * Tamanhos declarados (192 e 512) em vez de `any`: são os que o Android e o
     * Lighthouse procuram para considerar o site instalável.
     */
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
