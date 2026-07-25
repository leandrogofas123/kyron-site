import { ImageResponse } from "next/og";

/*
 * Imagem de compartilhamento padrão (WhatsApp, Instagram, buscadores).
 * Convenção do Next: este arquivo vira a og:image e a twitter:image de todas
 * as rotas que não definirem a sua própria. Sem ela, o link compartilhado
 * aparece "sem foto" — um dos furos de SEO/marketing do site.
 *
 * Autocontida: sem fontes externas nem imagens remotas (renderiza no build/edge).
 */

export const alt =
  "Kyron Tecnologia — Apple, Casa Inteligente e Automação em Santa Cruz do Sul";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#060709",
          backgroundImage:
            "radial-gradient(circle at 50% 20%, rgba(30,107,255,0.30), transparent 62%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 150,
            fontWeight: 800,
            letterSpacing: 16,
            color: "#FFFFFF",
          }}
        >
          KYRON
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 6,
            fontSize: 34,
            letterSpacing: 28,
            color: "#1E6BFF",
          }}
        >
          TECNOLOGIA
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 52,
            fontSize: 32,
            color: "#C9CDD4",
          }}
        >
          Apple · Seminovos · Casa Inteligente · Áudio
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 16,
            fontSize: 24,
            color: "#9AA0A9",
          }}
        >
          Santa Cruz do Sul · RS
        </div>
      </div>
    ),
    { ...size },
  );
}
