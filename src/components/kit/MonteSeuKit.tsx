"use client";

import { useMemo, useState } from "react";

import { formatarPreco, precoVigente } from "@/lib/format";

export type ProdutoKit = {
  id: number;
  slug: string;
  nome: string;
  marca: string | null;
  preco: number;
  precoPromo: number | null;
  descricaoCurta: string | null;
  compatibilidade: string | null;
  categoria: { slug: string; nome: string };
  imagens: { url: string; principal: boolean }[];
  seminovo: { vendido: boolean } | null;
};

type EtapaId = "celular" | "pelicula-tela" | "pelicula-camera" | "capa" | "carregador" | "fone" | "extras";
type Etapa = { id: EtapaId; numero: string; titulo: string; descricao: string; obrigatoria?: boolean; multipla?: boolean };
type Selecoes = Record<EtapaId, ProdutoKit | ProdutoKit[] | null>;

const ETAPAS: Etapa[] = [
  { id: "celular", numero: "01", titulo: "Escolha seu celular", descricao: "Novo ou seminovo revisado. Este é o ponto de partida do seu kit.", obrigatoria: true },
  { id: "pelicula-tela", numero: "02", titulo: "Película para a tela", descricao: "Proteção indicada para o modelo que você escolheu." },
  { id: "pelicula-camera", numero: "03", titulo: "Película para a câmera", descricao: "Proteção extra para as lentes traseiras." },
  { id: "capa", numero: "04", titulo: "Case / capa", descricao: "Estilo e proteção com encaixe para o seu aparelho." },
  { id: "carregador", numero: "05", titulo: "Carregador", descricao: "Potência e conector certos para o seu novo kit." },
  { id: "fone", numero: "06", titulo: "Fone de ouvido", descricao: "Escolha o áudio que combina com a sua rotina." },
  { id: "extras", numero: "07", titulo: "Acessórios extras", descricao: "Power bank, tripé, luz para selfie, carregador ou suporte veicular.", multipla: true },
];

function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function modeloDoCelular(nome: string) {
  return nome.match(/iphone\s+\d+(?:\s+(?:pro|max|plus|mini))?/i)?.[0] ?? nome;
}

function pertenceAEtapa(produto: ProdutoKit, etapa: EtapaId) {
  const texto = normalizar(`${produto.categoria.slug} ${produto.categoria.nome} ${produto.nome}`);
  const iphone = texto.includes("iphone");
  if (etapa === "celular") return iphone && (texto.includes("novo") || texto.includes("seminovo"));
  if (etapa === "pelicula-tela") return texto.includes("pelicula") && !texto.includes("camera");
  if (etapa === "pelicula-camera") return texto.includes("pelicula") && texto.includes("camera");
  if (etapa === "capa") return texto.includes("capa") || texto.includes("case");
  if (etapa === "carregador") return texto.includes("carregador") || texto.includes("cabo");
  if (etapa === "fone") return texto.includes("fone") || texto.includes("airpods");
  return /power|tripe|selfie|veicular|suporte/.test(texto);
}

function compativel(produto: ProdutoKit, celular: ProdutoKit | null) {
  if (!celular || !produto.compatibilidade?.trim()) return true;
  const lista = normalizar(produto.compatibilidade);
  return lista.includes("universal") || lista.includes(normalizar(modeloDoCelular(celular.nome)));
}

function selecoesVazias(): Selecoes {
  return { celular: null, "pelicula-tela": null, "pelicula-camera": null, capa: null, carregador: null, fone: null, extras: [] };
}

function itensSelecionados(selecoes: Selecoes) {
  return ETAPAS.flatMap((etapa) => {
    const valor = selecoes[etapa.id];
    return Array.isArray(valor) ? valor : valor ? [valor] : [];
  });
}

function Miniatura({ produto, grande = false }: { produto: ProdutoKit; grande?: boolean }) {
  const imagem = produto.imagens.find((item) => item.principal) ?? produto.imagens[0];
  return (
    <span className={`relative block shrink-0 overflow-hidden rounded-kyron-sm bg-kyron-surface ${grande ? "h-20 w-20" : "h-12 w-12"}`}>
      {imagem ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imagem.url} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="kyron-display flex h-full w-full items-center justify-center text-fluid-sm text-kyron-silver/20">K</span>
      )}
    </span>
  );
}

export function MonteSeuKit({ produtos, whatsappBase }: { produtos: ProdutoKit[]; whatsappBase: string }) {
  const [selecoes, setSelecoes] = useState<Selecoes>(selecoesVazias);
  const [etapaAberta, setEtapaAberta] = useState<EtapaId | null>(null);
  const celular = selecoes.celular as ProdutoKit | null;
  const etapaAtual = ETAPAS.find((etapa) => etapa.id === etapaAberta) ?? null;
  const escolhidos = itensSelecionados(selecoes);
  const total = escolhidos.reduce((soma, produto) => soma + precoVigente(produto.preco, produto.precoPromo).atual, 0);

  const opcoes = useMemo(() => {
    if (!etapaAtual) return [];
    return produtos.filter((produto) => !produto.seminovo?.vendido && pertenceAEtapa(produto, etapaAtual.id) && compativel(produto, celular));
  }, [celular, etapaAtual, produtos]);

  function escolher(produto: ProdutoKit) {
    if (!etapaAtual) return;
    setSelecoes((anterior) => {
      if (etapaAtual.id === "celular") return { ...selecoesVazias(), celular: produto };
      if (etapaAtual.multipla) {
        const extras = anterior.extras as ProdutoKit[];
        return extras.some((item) => item.id === produto.id) ? anterior : { ...anterior, extras: [...extras, produto] };
      }
      return { ...anterior, [etapaAtual.id]: produto };
    });
    setEtapaAberta(null);
  }

  function remover(etapa: Etapa, produtoId?: number) {
    setSelecoes((anterior) => {
      if (etapa.id === "celular") return selecoesVazias();
      if (etapa.multipla) return { ...anterior, extras: (anterior.extras as ProdutoKit[]).filter((item) => item.id !== produtoId) };
      return { ...anterior, [etapa.id]: null };
    });
  }

  const mensagem = escolhidos.length
    ? `Olá! Montei este kit de celular no site da Kyron:\n\n${escolhidos.map((produto) => `• ${produto.nome} — ${formatarPreco(precoVigente(produto.preco, produto.precoPromo).atual)}`).join("\n")}\n\nTotal estimado: ${formatarPreco(total)}\n\nPodem confirmar compatibilidade, disponibilidade e prazo?`
    : "Olá! Quero montar um kit de celular e preciso de ajuda para escolher.";
  const linkWhatsapp = whatsappBase.startsWith("http") ? `${whatsappBase}?text=${encodeURIComponent(mensagem)}` : whatsappBase;

  return (
    <section className="border-t border-[var(--kyron-hairline)] py-fluid-xl">
      <div className="container-kyron grid gap-fluid-lg xl:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] xl:items-start">
        <div>
          <div className="mb-fluid-md flex flex-wrap items-center justify-between gap-fluid-sm">
            <div>
              <p className="kyron-label text-fluid-2xs text-kyron-blue">Configurador guiado</p>
              <h2 className="kyron-display mt-1 text-fluid-2xl text-kyron-white">Monte o seu kit.</h2>
            </div>
            <p className="rounded-full border border-[var(--kyron-hairline)] px-3 py-1.5 text-fluid-2xs text-kyron-silver">{escolhidos.length} de {ETAPAS.length} itens escolhidos</p>
          </div>

          <ol className="space-y-fluid-sm">
            {ETAPAS.map((etapa) => {
              const valor = selecoes[etapa.id];
              const itens = Array.isArray(valor) ? valor : valor ? [valor] : [];
              const bloqueada = etapa.id !== "celular" && !celular;
              return (
                <li key={etapa.id} className={`rounded-kyron-md border bg-kyron-graphite p-fluid-md transition-colors duration-300 ${itens.length ? "border-[var(--kyron-blue-line)]" : "border-[var(--kyron-hairline)]"}`}>
                  <div className="flex items-start gap-fluid-sm">
                    <span aria-hidden="true" className="kyron-display mt-0.5 text-fluid-sm text-kyron-blue">{etapa.numero}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-fluid-base font-semibold text-kyron-white">{etapa.titulo}</h3>
                        {etapa.obrigatoria && <span className="kyron-label text-fluid-2xs text-kyron-blue">Obrigatório</span>}
                      </div>
                      <p className="mt-1 text-fluid-sm text-kyron-silver/75">{etapa.descricao}</p>
                      {itens.length ? (
                        <ul className="mt-fluid-sm space-y-2">
                          {itens.map((produto) => (
                            <li key={produto.id} className="flex items-center gap-3 rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-black/45 p-2">
                              <Miniatura produto={produto} />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-fluid-sm font-medium text-kyron-white">{produto.nome}</p>
                                <p className="text-fluid-2xs text-kyron-silver">{formatarPreco(precoVigente(produto.preco, produto.precoPromo).atual)}</p>
                              </div>
                              <button type="button" onClick={() => remover(etapa, produto.id)} className="min-h-11 rounded-kyron-sm px-2 text-fluid-2xs text-kyron-silver transition-colors hover:text-kyron-white">Remover</button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-fluid-sm text-fluid-2xs text-kyron-silver/55">{bloqueada ? "Escolha o celular primeiro para ver acessórios compatíveis." : "Nenhum item selecionado."}</p>
                      )}
                      <button type="button" disabled={bloqueada} onClick={() => setEtapaAberta(etapa.id)} className="kyron-label mt-fluid-sm min-h-11 rounded-kyron-sm border border-[var(--kyron-hairline-strong)] px-3.5 text-fluid-2xs text-kyron-white transition-all duration-300 hover:border-[var(--kyron-blue-line)] hover:text-kyron-blue disabled:cursor-not-allowed disabled:opacity-35">
                        {itens.length ? etapa.multipla ? "Adicionar outro" : "Trocar item" : "Escolher item"}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <aside className="xl:sticky xl:top-[calc(clamp(3.75rem,7vw,4.5rem)+var(--spacing-fluid-sm))]">
          <div className="rounded-kyron-md border border-[var(--kyron-hairline-strong)] bg-kyron-graphite p-fluid-md shadow-[0_16px_44px_rgba(0,0,0,0.28)]">
            <p className="kyron-label text-fluid-2xs text-kyron-silver/60">Resumo do kit</p>
            {escolhidos.length ? (
              <ul className="mt-fluid-sm space-y-2 border-y border-[var(--kyron-hairline)] py-fluid-sm">
                {escolhidos.map((produto) => <li key={produto.id} className="flex items-start justify-between gap-3 text-fluid-xs"><span className="min-w-0 text-kyron-silver">{produto.nome}</span><span className="shrink-0 text-kyron-white">{formatarPreco(precoVigente(produto.preco, produto.precoPromo).atual)}</span></li>)}
              </ul>
            ) : <p className="mt-fluid-sm border-y border-[var(--kyron-hairline)] py-fluid-sm text-fluid-sm text-kyron-silver">Selecione um celular para começar seu kit.</p>}
            <div className="mt-fluid-md flex items-end justify-between gap-3"><p className="text-fluid-xs text-kyron-silver">Total estimado</p><p className="kyron-display text-fluid-xl text-kyron-white">{formatarPreco(total)}</p></div>
            <p className="mt-1 text-fluid-2xs text-kyron-silver/55">Disponibilidade e compatibilidade confirmadas pela Kyron antes do atendimento.</p>
            <a href={linkWhatsapp} target={linkWhatsapp.startsWith("http") ? "_blank" : undefined} rel={linkWhatsapp.startsWith("http") ? "noopener noreferrer" : undefined} className="kyron-label mt-fluid-md flex min-h-12 items-center justify-center rounded-kyron-sm bg-kyron-blue px-4 text-center text-fluid-xs text-white transition-all duration-300 hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(30,107,255,0.28)]">{celular ? "Enviar kit no WhatsApp" : "Quero ajuda para escolher"}</a>
          </div>
        </aside>
      </div>

      {etapaAtual && (
        <div role="dialog" aria-modal="true" aria-labelledby="titulo-selecao-kit" className="fixed inset-0 z-[60] flex items-end bg-black/70 p-fluid-sm backdrop-blur-sm md:items-center md:justify-center">
          <div className="max-h-[min(44rem,calc(100dvh-2rem))] w-full max-w-[54rem] overflow-y-auto rounded-kyron-md border border-[var(--kyron-hairline-strong)] bg-kyron-black p-fluid-md shadow-[0_24px_64px_rgba(0,0,0,0.6)]">
            <div className="flex items-start justify-between gap-fluid-sm">
              <div><p className="kyron-label text-fluid-2xs text-kyron-blue">{etapaAtual.numero}</p><h2 id="titulo-selecao-kit" className="kyron-display mt-1 text-fluid-xl text-kyron-white">{etapaAtual.titulo}</h2>{celular && etapaAtual.id !== "celular" && <p className="mt-1 text-fluid-xs text-kyron-silver">Mostrando opções para {modeloDoCelular(celular.nome)}.</p>}</div>
              <button type="button" onClick={() => setEtapaAberta(null)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-kyron-sm text-kyron-silver transition-colors hover:text-kyron-white" aria-label="Fechar seleção">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              </button>
            </div>
            {opcoes.length ? (
              <ul className="mt-fluid-md grid gap-fluid-sm sm:grid-cols-2">
                {opcoes.map((produto) => <li key={produto.id}><button type="button" onClick={() => escolher(produto)} className="group flex h-full w-full gap-3 rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-graphite p-3 text-left transition-all duration-300 hover:-translate-y-px hover:border-[var(--kyron-blue-line)]"><Miniatura produto={produto} grande /><span className="min-w-0 flex-1">{produto.marca && <span className="kyron-label text-fluid-2xs text-kyron-silver/55">{produto.marca}</span>}<span className="mt-1 block text-fluid-sm font-semibold text-kyron-white">{produto.nome}</span>{produto.descricaoCurta && <span className="mt-1 block text-fluid-2xs leading-snug text-kyron-silver">{produto.descricaoCurta}</span>}<span className="mt-2 block text-fluid-sm font-semibold text-kyron-blue">{formatarPreco(precoVigente(produto.preco, produto.precoPromo).atual)}</span></span></button></li>)}
              </ul>
            ) : (
              <div className="mt-fluid-md rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-graphite p-fluid-md"><p className="text-fluid-base text-kyron-white">Ainda não há opções cadastradas nesta etapa.</p><p className="mt-1 text-fluid-sm text-kyron-silver">Fale com a Kyron para verificar disponibilidade ou pedir um item específico.</p><a href={linkWhatsapp} target={linkWhatsapp.startsWith("http") ? "_blank" : undefined} rel={linkWhatsapp.startsWith("http") ? "noopener noreferrer" : undefined} className="kyron-label mt-fluid-sm inline-flex min-h-11 items-center rounded-kyron-sm bg-kyron-blue px-3.5 text-fluid-2xs text-white">Falar no WhatsApp</a></div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
