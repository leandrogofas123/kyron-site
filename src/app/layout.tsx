import type { Metadata, Viewport } from "next";
import { Orbitron, Exo_2 } from "next/font/google";

import { SITE_URL } from "@/lib/kyron/site";

import "./globals.css";

/*
 * Layout raiz — só o essencial que vale para TODAS as rotas (loja e admin):
 * <html>, <body> e as fontes auto-hospedadas. A casca visual da loja
 * (cabeçalho, rodapé, WhatsApp, robô, cookies) vive em (site)/layout.tsx, para
 * NÃO aparecer no painel admin.
 */
const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-orbitron",
  display: "swap",
});

const exo2 = Exo_2({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-exo2",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Kyron Tecnologia — Apple, Casa Inteligente e Automação em Santa Cruz do Sul",
    template: "%s | Kyron Tecnologia",
  },
  description:
    "Apple novos e seminovos, casa inteligente, áudio e serviços de instalação em Santa Cruz do Sul. Atendimento consultivo e conversa direta no WhatsApp.",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Kyron Tecnologia",
    url: SITE_URL,
  },
};

export const viewport: Viewport = {
  themeColor: "#060709",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${orbitron.variable} ${exo2.variable}`}>
      <body>{children}</body>
    </html>
  );
}
