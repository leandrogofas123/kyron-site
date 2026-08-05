/**
 * Conteúdo do banner rotativo de Automação Residencial da Home.
 *
 * Para adicionar/editar um banner, basta mexer NESTE array — o componente
 * <BannerAutomacao> se adapta sozinho (quantidade de slides, bolinhas, etc.).
 *
 * `imagem` é opcional: sem foto real, o componente desenha um painel gráfico
 * da marca (glow azul + ícone). Quando houver foto do produto, é só preencher
 * `imagem: { src, alt }` com um arquivo em /public.
 */

export type IconeBanner = "casa" | "controle" | "voz" | "instalacao";

type CtaLink = { readonly label: string; readonly href: string };
type CtaWhatsApp = { readonly label: string; readonly whatsapp: string };

export type BannerAutomacao = {
  readonly id: string;
  readonly eyebrow: string;
  readonly titulo: string;
  readonly texto: string;
  readonly itens?: readonly string[];
  readonly cta: CtaLink | CtaWhatsApp;
  readonly icone: IconeBanner;
  readonly imagem?: { readonly src: string; readonly alt: string };
};

// Todos os CTAs de produto levam à linha de Casa Inteligente do catálogo.
const CATALOGO_CASA = "/produtos?categoria=casa-inteligente";

export const BANNERS_AUTOMACAO: readonly BannerAutomacao[] = [
  {
    id: "automacao-residencial",
    eyebrow: "Casa Inteligente",
    titulo: "Automação Residencial",
    texto: "Controle sua casa pelo celular ou por voz.",
    itens: ["Alexa", "Tomadas inteligentes", "Lâmpadas inteligentes"],
    cta: { label: "Conhecer produtos", href: CATALOGO_CASA },
    icone: "casa",
    imagem: { src: "/automacao/automacao-residencial.jpg", alt: "Painel de casa inteligente controlando iluminação e ambiente" },
  },
  {
    id: "controle-tv-ar",
    eyebrow: "Controle universal",
    titulo: "Controle sua TV e Ar Condicionado",
    texto:
      "Transforme qualquer aparelho com controle remoto em um dispositivo inteligente utilizando módulos infravermelho.",
    itens: [
      "Controle IR Wi-Fi",
      "Compatível com Alexa",
      "Compatível com Google Home",
    ],
    cta: { label: "Ver solução", href: CATALOGO_CASA },
    icone: "controle",
    imagem: { src: "/automacao/controle-clima.jpg", alt: "Termostato inteligente na parede controlando o clima do ambiente" },
  },
  {
    id: "casa-alexa",
    eyebrow: "Comando de voz",
    titulo: "Casa Inteligente com Alexa",
    texto:
      "Crie rotinas, automatize iluminação, ligue aparelhos por voz e tenha mais conforto no dia a dia.",
    cta: { label: "Conhecer automação", href: CATALOGO_CASA },
    icone: "voz",
    imagem: { src: "/automacao/casa-alexa.jpg", alt: "Assistente de voz inteligente sobre a estante de uma sala" },
  },
  {
    id: "venda-instalacao",
    eyebrow: "Serviço completo",
    titulo: "Venda, Configuração e Instalação",
    texto:
      "A Kyron vende, configura e instala toda a automação residencial para você.",
    cta: {
      label: "Falar no WhatsApp",
      whatsapp:
        "Olá! Quero saber sobre automação residencial — venda, configuração e instalação.",
    },
    icone: "instalacao",
    imagem: { src: "/automacao/instalacao.jpg", alt: "Interruptor inteligente instalado na parede pela equipe Kyron" },
  },
];
