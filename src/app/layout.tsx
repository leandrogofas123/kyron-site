import type { Metadata, Viewport } from "next";

import { SITE_URL } from "@/lib/kyron/site";

import "./globals.css";

/*
 * Layout raiz — só o essencial que vale para TODAS as rotas (loja e ERP):
 * <html> e <body>. A tipografia é a fonte padrão do sistema (globals.css),
 * sem webfonts. A casca visual da loja (cabeçalho, rodapé, WhatsApp, robô,
 * cookies) vive em (site)/layout.tsx, para NÃO aparecer no ERP.
 */

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
  twitter: {
    card: "summary_large_image",
    title:
      "Kyron Tecnologia — Apple, Casa Inteligente e Automação em Santa Cruz do Sul",
    description:
      "Apple novos e seminovos, casa inteligente, áudio e serviços de instalação. Conversa direta no WhatsApp.",
  },
};

export const viewport: Viewport = {
  themeColor: "#060709",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Aplica o tema salvo antes da pintura, evitando "flash" de tema. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('kyron-tema');if(t)document.documentElement.setAttribute('data-tema',t);}catch(e){}",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
