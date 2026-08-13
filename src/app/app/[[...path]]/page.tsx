import { permanentRedirect } from "next/navigation";

type LegacyAcademyRedirectProps = {
  params: Promise<{ path?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Keeps old /app links working while /academy becomes the canonical route. */
export default async function LegacyAcademyRedirect({
  params,
  searchParams,
}: LegacyAcademyRedirectProps) {
  const [{ path = [] }, query] = await Promise.all([params, searchParams]);
  const destino = `/academy${path.length ? `/${path.map(encodeURIComponent).join("/")}` : ""}`;
  const busca = new URLSearchParams();

  for (const [chave, valor] of Object.entries(query)) {
    if (Array.isArray(valor)) valor.forEach((item) => busca.append(chave, item));
    else if (valor) busca.set(chave, valor);
  }

  permanentRedirect(busca.size ? `${destino}?${busca}` : destino);
}
