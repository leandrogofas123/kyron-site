import Image from "next/image";

/**
 * Imagem do produto com proporção fixa (quadrada).
 *
 * Produto sem foto mostra um marcador da marca em vez de quadro vazio — o dono
 * cadastra a foto depois, e o layout não quebra enquanto isso.
 */
export function ProdutoImagem({
  src,
  alt,
  prioridade = false,
}: {
  src?: string | null;
  alt: string;
  prioridade?: boolean;
}) {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-kyron-sm bg-kyron-graphite">
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 16vw"
          priority={prioridade}
          className="object-cover transition-transform duration-[400ms] ease-in-out group-hover:scale-[1.03]"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_50%_40%,rgba(30,107,255,0.08),transparent_70%)]"
        >
          <span className="kyron-display text-[clamp(2rem,8vw,3.5rem)] tracking-[0.2em] text-kyron-silver/15">
            K
          </span>
        </div>
      )}
    </div>
  );
}
