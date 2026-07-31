import { GerenciarBanners } from "@/components/erp/GerenciarBanners";
import { colaboradorLogado, podeFazer } from "@/lib/erp/auth";
import { listarBanners, POSICOES } from "@/lib/site/banners";

export const dynamic = "force-dynamic";

export default async function ErpSiteBanners() {
  const eu = await colaboradorLogado();
  if (!eu || !podeFazer(eu.papel, "produtos.editar")) {
    return (
      <div className="mx-auto max-w-[40rem] rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-lg text-center">
        <h1 className="kyron-display text-fluid-lg text-kyron-white">Acesso restrito</h1>
        <p className="mt-fluid-sm text-fluid-base text-kyron-silver">
          Você não tem permissão para gerenciar o conteúdo do site.
        </p>
      </div>
    );
  }

  const banners = await listarBanners();

  return (
    <>
      <div className="mb-fluid-lg">
        <h1 className="kyron-display text-fluid-xl text-kyron-white">Site · Banners</h1>
        <p className="text-fluid-2xs text-kyron-silver/60">
          Campanhas e publicidade do site. Vários na mesma posição viram carrossel
          automático. A arte é otimizada no upload.
        </p>
      </div>

      <GerenciarBanners
        posicoes={POSICOES}
        banners={banners.map((b) => ({
          ...b,
          inicioEm: b.inicioEm ? b.inicioEm.toISOString() : null,
          fimEm: b.fimEm ? b.fimEm.toISOString() : null,
        }))}
      />
    </>
  );
}
