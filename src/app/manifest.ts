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
    icons: [
      {
        src: "/marca/kyron-simbolo.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
