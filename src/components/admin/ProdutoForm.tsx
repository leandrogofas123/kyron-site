"use client";

import Image from "next/image";
import { useActionState, useState } from "react";

import {
  acaoDefinirImagemPrincipal,
  acaoExcluirImagem,
  acaoSalvarProduto,
} from "@/lib/admin-actions";

type CategoriaOpc = { id: number; label: string };

export type ProdutoEdit = {
  id: number;
  nome: string;
  marca: string | null;
  categoriaId: number;
  preco: number;
  precoPromo: number | null;
  descricaoCurta: string | null;
  descricaoLonga: string | null;
  compatibilidade: string | null;
  destaque: boolean;
  ativo: boolean;
  imagens: { id: number; url: string; principal: boolean }[];
  seminovo: {
    saudeBateria: number | null;
    condicaoEstetica: string;
    cor: string | null;
    capacidade: string | null;
    garantiaMeses: number;
    vendido: boolean;
  } | null;
};

const campo =
  "w-full rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-graphite px-fluid-sm py-fluid-xs text-fluid-base text-kyron-white placeholder:text-kyron-silver/40 focus:border-[var(--kyron-blue-line)] focus:outline-none";
const rotulo = "kyron-label mb-fluid-2xs block text-fluid-2xs text-kyron-silver/70";

/** Centavos → "1999,90" para o campo de texto. */
function reais(centavos: number | null): string {
  if (centavos == null) return "";
  return (centavos / 100).toFixed(2).replace(".", ",");
}

export function ProdutoForm({
  categorias,
  produto,
}: {
  categorias: CategoriaOpc[];
  produto?: ProdutoEdit;
}) {
  const [estado, formAction, pendente] = useActionState(acaoSalvarProduto, null);
  const [ehSeminovo, setEhSeminovo] = useState(Boolean(produto?.seminovo));

  return (
    <div className="max-w-[40rem] space-y-fluid-lg">
      {/* Imagens já cadastradas (só no editar) */}
      {produto && produto.imagens.length > 0 && (
        <div>
          <p className={rotulo}>Fotos</p>
          <ul className="flex flex-wrap gap-fluid-xs">
            {produto.imagens.map((img) => (
              <li key={img.id} className="relative">
                <div
                  className={`relative h-20 w-20 overflow-hidden rounded-kyron-sm border ${
                    img.principal ? "border-[var(--kyron-blue-line)]" : "border-[var(--kyron-hairline)]"
                  }`}
                >
                  <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
                </div>
                <div className="mt-1 flex gap-1">
                  {!img.principal && (
                    <button
                      type="button"
                      onClick={() => acaoDefinirImagemPrincipal(img.id, produto.id)}
                      className="text-[10px] text-kyron-blue underline"
                    >
                      Principal
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => acaoExcluirImagem(img.id)}
                    className="text-[10px] text-kyron-silver/60 underline"
                  >
                    Remover
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form action={formAction} className="space-y-fluid-md">
        {produto && <input type="hidden" name="id" value={produto.id} />}

        {/* Os 4 campos do cadastro de 90 segundos */}
        <div>
          <label htmlFor="foto" className={rotulo}>
            Foto {produto ? "(adicionar mais uma)" : ""}
          </label>
          <input
            id="foto"
            name="foto"
            type="file"
            accept="image/*"
            className="block w-full text-fluid-sm text-kyron-silver file:mr-fluid-sm file:rounded-kyron-sm file:border-0 file:bg-kyron-blue file:px-fluid-sm file:py-2 file:text-fluid-2xs file:text-white"
          />
        </div>

        <div>
          <label htmlFor="nome" className={rotulo}>Nome *</label>
          <input id="nome" name="nome" defaultValue={produto?.nome} required className={campo} />
        </div>

        <div className="grid-fluida-2 [--gap:var(--spacing-fluid-md)]">
          <div>
            <label htmlFor="categoriaId" className={rotulo}>Categoria *</label>
            <select id="categoriaId" name="categoriaId" defaultValue={produto?.categoriaId} required className={campo}>
              <option value="">Escolha…</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="preco" className={rotulo}>Preço (R$) *</label>
            <input id="preco" name="preco" inputMode="decimal" placeholder="1999,90" defaultValue={reais(produto?.preco ?? null)} required className={campo} />
          </div>
        </div>

        {/* Opcionais */}
        <div className="grid-fluida-2 [--gap:var(--spacing-fluid-md)]">
          <div>
            <label htmlFor="precoPromo" className={rotulo}>Preço promocional (R$)</label>
            <input id="precoPromo" name="precoPromo" inputMode="decimal" placeholder="opcional" defaultValue={reais(produto?.precoPromo ?? null)} className={campo} />
          </div>
          <div>
            <label htmlFor="marca" className={rotulo}>Marca</label>
            <input id="marca" name="marca" defaultValue={produto?.marca ?? ""} className={campo} />
          </div>
        </div>

        <div>
          <label htmlFor="descricaoCurta" className={rotulo}>Descrição curta</label>
          <input id="descricaoCurta" name="descricaoCurta" defaultValue={produto?.descricaoCurta ?? ""} className={campo} placeholder="Aparece no card e na busca" />
        </div>

        <div>
          <label htmlFor="descricaoLonga" className={rotulo}>Descrição completa</label>
          <textarea id="descricaoLonga" name="descricaoLonga" rows={4} defaultValue={produto?.descricaoLonga ?? ""} className={`${campo} resize-y`} />
        </div>


        <div>
          <label htmlFor="compatibilidade" className={rotulo}>
            Compatibilidade
          </label>
          <input
            id="compatibilidade"
            name="compatibilidade"
            defaultValue={produto?.compatibilidade ?? ""}
            className={campo}
            placeholder="Ex.: iPhone 15, iPhone 14 ou Universal"
          />
          <p className="mt-1 text-fluid-2xs text-kyron-silver/55">
            Usado no Monte seu Kit Celular para mostrar acess?rios certos.
          </p>
        </div>
        <div className="flex flex-wrap gap-fluid-md">
          <label className="flex items-center gap-fluid-xs text-fluid-sm text-kyron-silver">
            <input type="checkbox" name="destaque" defaultChecked={produto?.destaque} className="h-4 w-4 accent-[#1e6bff]" />
            Mostrar na home
          </label>
          <label className="flex items-center gap-fluid-xs text-fluid-sm text-kyron-silver">
            <input type="checkbox" name="ativo" defaultChecked={produto ? produto.ativo : true} value="on" className="h-4 w-4 accent-[#1e6bff]" />
            Ativo (visível no site)
          </label>
        </div>

        {/* Seminovo */}
        <div className="rounded-kyron-md border border-[var(--kyron-hairline)] p-fluid-md">
          <label className="flex items-center gap-fluid-xs text-fluid-sm text-kyron-white">
            <input
              type="checkbox"
              name="ehSeminovo"
              checked={ehSeminovo}
              onChange={(e) => setEhSeminovo(e.target.checked)}
              className="h-4 w-4 accent-[#1e6bff]"
            />
            É um seminovo
          </label>

          {ehSeminovo && (
            <div className="mt-fluid-md space-y-fluid-md">
              <div className="grid-fluida-2 [--gap:var(--spacing-fluid-md)]">
                <div>
                  <label htmlFor="saudeBateria" className={rotulo}>Saúde da bateria (%)</label>
                  <input id="saudeBateria" name="saudeBateria" type="number" min={0} max={100} defaultValue={produto?.seminovo?.saudeBateria ?? ""} className={campo} />
                </div>
                <div>
                  <label htmlFor="condicaoEstetica" className={rotulo}>Condição</label>
                  <select id="condicaoEstetica" name="condicaoEstetica" defaultValue={produto?.seminovo?.condicaoEstetica ?? "bom"} className={campo}>
                    <option value="impecável">Impecável</option>
                    <option value="ótimo">Ótimo</option>
                    <option value="bom">Bom</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="capacidade" className={rotulo}>Capacidade</label>
                  <input id="capacidade" name="capacidade" placeholder="128GB" defaultValue={produto?.seminovo?.capacidade ?? ""} className={campo} />
                </div>
                <div>
                  <label htmlFor="cor" className={rotulo}>Cor</label>
                  <input id="cor" name="cor" defaultValue={produto?.seminovo?.cor ?? ""} className={campo} />
                </div>
                <div>
                  <label htmlFor="garantiaMeses" className={rotulo}>Garantia (meses)</label>
                  <input id="garantiaMeses" name="garantiaMeses" type="number" min={0} defaultValue={produto?.seminovo?.garantiaMeses ?? 3} className={campo} />
                </div>
              </div>
              <label className="flex items-center gap-fluid-xs text-fluid-sm text-kyron-silver">
                <input type="checkbox" name="vendido" defaultChecked={produto?.seminovo?.vendido} className="h-4 w-4 accent-[#1e6bff]" />
                Já vendido (some da vitrine)
              </label>
            </div>
          )}
        </div>

        {estado?.erro && (
          <p role="alert" className="text-fluid-sm text-kyron-blue">{estado.erro}</p>
        )}

        <button type="submit" disabled={pendente} className="kyron-label rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-sm text-fluid-xs text-white transition-all duration-300 hover:-translate-y-px disabled:opacity-50">
          {pendente ? "Salvando…" : "Salvar produto"}
        </button>
      </form>
    </div>
  );
}
