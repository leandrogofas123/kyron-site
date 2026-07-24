import Image from "next/image";
import Link from "next/link";

import horizontal from "../../../public/marca/kyron-horizontal.png";
import simbolo from "../../../public/marca/kyron-simbolo.png";

/**
 * Logotipo oficial da Kyron.
 *
 * O arquivo é usado como está — o Manual §11 proíbe recriar, redesenhar ou
 * alterar cores, proporções e inclinação da marca. Nada aqui reconstrói o
 * logotipo em código.
 *
 * Proporções reais dos arquivos:
 *   horizontal  1474 × 484  (≈ 3,05:1)
 *   símbolo      490 × 512  (≈ 0,96:1)
 *
 * A PROVIDENCIAR: versão SVG. O PNG funciona, mas vetor é mais nítido em tela
 * de alta densidade e pesa menos. Consta como pendência no LEIA-ME da marca.
 */

type Props = {
  /** `null` remove o link — usar quando o logo já está dentro de outro link. */
  href?: string | null;
  /** `simbolo` mostra só o K. Use em espaços muito estreitos. */
  variante?: "horizontal" | "simbolo";
  /** Altura renderizada. Mínimo do Manual: 24px (símbolo isolado: 48px). */
  altura?: number;
  prioridade?: boolean;
};

export function Logo({
  href = "/",
  variante = "horizontal",
  altura = 30,
  prioridade = false,
}: Props) {
  const fonte = variante === "horizontal" ? horizontal : simbolo;
  const largura = Math.round((fonte.width / fonte.height) * altura);

  const marca = (
    <Image
      src={fonte}
      alt="Kyron Tecnologia"
      width={largura}
      height={altura}
      priority={prioridade}
      // Altura fixa em rem para acompanhar a escala do restante do site.
      style={{ height: `${altura / 16}rem`, width: "auto" }}
    />
  );

  if (!href) return marca;

  return (
    <Link
      href={href}
      aria-label="Kyron Tecnologia — página inicial"
      // Área de respiro = metade da altura do símbolo (Manual §11).
      className="inline-flex items-center py-1"
    >
      {marca}
    </Link>
  );
}
