import Link from "next/link";

import { BotaoPreferenciasCookies } from "./BotaoPreferenciasCookies";
import { Logo } from "./Logo";
import { KYRON_COMPANY } from "@/lib/kyron/company";
import { CONTATO, linkWhatsApp } from "@/lib/kyron/site";

const CATALOGO = [
  { label: "Produtos", href: "/produtos" },
  { label: "iPhone seminovos", href: "/seminovos" },
  { label: "Serviços", href: "/servicos" },
];

const EMPRESA = [
  { label: "Sobre a Kyron", href: "/sobre" },
  { label: "Contato", href: "/contato" },
  { label: "Pedir orçamento", href: "/orcamento" },
];

export function Footer() {
  const whats = linkWhatsApp();
  const ano = 2026;

  return (
    <footer className="border-t border-[var(--kyron-hairline)] pb-fluid-lg pt-fluid-xl">
      <div className="container-kyron">
        <div className="grid-fluida-4 [--gap:var(--spacing-fluid-lg)]">
          <div>
            <Logo altura={34} />
            <p className="mt-fluid-sm max-w-[34ch] text-fluid-xs text-kyron-silver/70">
              Apple, casa inteligente, áudio e serviços de instalação em Santa
              Cruz do Sul e região.
            </p>
          </div>

          <div>
            <h2 className="kyron-label mb-fluid-xs text-fluid-2xs text-kyron-silver/50">
              Catálogo
            </h2>
            <ul>
              {CATALOGO.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block py-1.5 text-fluid-sm text-kyron-silver transition-colors duration-300 hover:text-kyron-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="kyron-label mb-fluid-xs text-fluid-2xs text-kyron-silver/50">
              A loja
            </h2>
            <ul>
              {EMPRESA.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block py-1.5 text-fluid-sm text-kyron-silver transition-colors duration-300 hover:text-kyron-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="kyron-label mb-fluid-xs text-fluid-2xs text-kyron-silver/50">
              Contato
            </h2>
            <ul className="text-fluid-sm text-kyron-silver">
              {whats && (
                <li>
                  <a
                    href={whats}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block py-1.5 transition-colors duration-300 hover:text-kyron-white"
                  >
                    WhatsApp
                  </a>
                </li>
              )}
              {CONTATO.email && (
                <li>
                  <a
                    href={`mailto:${CONTATO.email}`}
                    className="block break-words py-1.5 transition-colors duration-300 hover:text-kyron-white"
                  >
                    {CONTATO.email}
                  </a>
                </li>
              )}
              <li className="py-1.5">{KYRON_COMPANY.enderecoPublico}</li>
              <li className="py-1.5 text-kyron-silver/70">
                CNPJ {KYRON_COMPANY.cnpj}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-fluid-lg flex flex-wrap justify-between gap-fluid-xs border-t border-[var(--kyron-hairline)] pt-fluid-md text-fluid-2xs text-kyron-silver/55">
          <p>
            © {ano} {KYRON_COMPANY.nomeFantasia} · {KYRON_COMPANY.razaoSocial}
          </p>
          <p className="flex flex-wrap gap-fluid-xs">
            <Link href="/politica-de-privacidade" className="inline-block py-1.5 hover:text-kyron-silver">
              Política de Privacidade
            </Link>
            <Link href="/termos-de-uso" className="inline-block py-1.5 hover:text-kyron-silver">
              Termos de Uso
            </Link>
            <BotaoPreferenciasCookies />
          </p>
        </div>
      </div>
    </footer>
  );
}
