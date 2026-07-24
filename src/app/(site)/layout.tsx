import { FloatingWhatsApp } from "@/components/catalogo/FloatingWhatsApp";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { Analytics } from "@/components/site/Analytics";
import { ConsentimentoCookies } from "@/components/site/ConsentimentoCookies";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { KYRON_COMPANY } from "@/lib/kyron/company";
import { CONTATO, SITE_URL } from "@/lib/kyron/site";

/**
 * Casca da loja pública — cabeçalho, rodapé, WhatsApp flutuante, assistente,
 * cookies e medição. Aplica-se a tudo dentro de (site), nunca ao /admin.
 */

/**
 * Schema LocalBusiness — loja física. É o que o Google usa na busca local
 * ("loja de iphone em santa cruz do sul") e no painel do Maps. Só dados
 * verificáveis; horário e geo entram quando confirmados.
 */
const schemaLoja = {
  "@context": "https://schema.org",
  "@type": ["Store", "LocalBusiness"],
  name: KYRON_COMPANY.nomeFantasia,
  legalName: KYRON_COMPANY.razaoSocial,
  taxID: KYRON_COMPANY.cnpj,
  url: SITE_URL,
  logo: `${SITE_URL}/marca/kyron-horizontal.png`,
  image: `${SITE_URL}/marca/kyron-horizontal.png`,
  description:
    "Loja e integradora de tecnologia em Santa Cruz do Sul: Apple novos e seminovos, casa inteligente, áudio e serviços de instalação.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Santa Cruz do Sul",
    addressRegion: "RS",
    addressCountry: "BR",
  },
  areaServed: { "@type": "City", name: "Santa Cruz do Sul" },
  ...(KYRON_COMPANY.whatsapp && {
    telephone: `+${KYRON_COMPANY.whatsapp.replace(/\D/g, "")}`,
  }),
  ...(CONTATO.email && { email: CONTATO.email }),
};

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-kyron-sm focus:bg-kyron-blue focus:px-4 focus:py-2 focus:text-white"
      >
        Pular para o conteúdo
      </a>

      <Header />
      <main id="conteudo">{children}</main>
      <Footer />
      <FloatingWhatsApp />
      <ChatWidget />
      <ConsentimentoCookies />
      <Analytics />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaLoja) }}
      />
    </>
  );
}
