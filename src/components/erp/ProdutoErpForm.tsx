"use client";

import Link from "next/link";
import { useActionState } from "react";

import { acaoSalvarProdutoErp } from "@/lib/erp/acoes-estoque";

const campo =
  "w-full rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-black px-fluid-sm py-fluid-xs text-fluid-sm text-kyron-white focus:border-[var(--kyron-blue-line)] focus:outline-none";
const rotulo = "kyron-label mb-fluid-2xs block text-fluid-2xs text-kyron-silver/70";

export type ProdutoErp = {
  id: number;
  nome: string;
  marca: string | null;
  modelo: string | null;
  cor: string | null;
  capacidade: string | null;
  voltagem: string | null;
  sku: string | null;
  ean: string | null;
  ncm: string | null;
  codigoInterno: string | null;
  localizacao: string | null;
  compatibilidade: string | null;
  descricaoCurta: string | null;
  observacoes: string | null;
  garantiaMeses: number | null;
  quantidadeMinima: number;
  quantidade: number;
  preco: number;
  precoCusto: number | null;
  precoMinimo: number | null;
  categoriaId: number;
  fornecedorId: number | null;
  ativo: boolean;
};

type Opcao = { id: number; nome: string };

function reais(centavos: number | null | undefined): string {
  if (centavos == null) return "";
  return (centavos / 100).toFixed(2).replace(".", ",");
}

export function ProdutoErpForm({
  produto,
  categorias,
  fornecedores,
}: {
  produto?: ProdutoErp;
  categorias: (Opcao & { parentId: number | null })[];
  fornecedores: Opcao[];
}) {
  const [estado, salvar, salvando] = useActionState(acaoSalvarProdutoErp, null);

  return (
    <form action={salvar} className="space-y-fluid-lg">
      {produto && <input type="hidden" name="id" value={produto.id} />}

      <Bloco titulo="Identificação">
        <Campo id="nome" label="Nome *" span2>
          <input id="nome" name="nome" defaultValue={produto?.nome} required className={campo} />
        </Campo>
        <Campo id="marca" label="Marca">
          <input id="marca" name="marca" defaultValue={produto?.marca ?? ""} className={campo} />
        </Campo>
        <Campo id="modelo" label="Modelo">
          <input id="modelo" name="modelo" defaultValue={produto?.modelo ?? ""} className={campo} />
        </Campo>
        <Campo id="categoriaId" label="Categoria *">
          <select
            id="categoriaId"
            name="categoriaId"
            defaultValue={produto?.categoriaId ?? ""}
            required
            className={campo}
          >
            <option value="">Selecione…</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.parentId ? "— " : ""}
                {c.nome}
              </option>
            ))}
          </select>
        </Campo>
        <Campo id="fornecedorId" label="Fornecedor">
          <select
            id="fornecedorId"
            name="fornecedorId"
            defaultValue={produto?.fornecedorId ?? ""}
            className={campo}
          >
            <option value="">—</option>
            {fornecedores.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome}
              </option>
            ))}
          </select>
        </Campo>
      </Bloco>

      <Bloco titulo="Códigos">
        <Campo id="sku" label="SKU">
          <input id="sku" name="sku" defaultValue={produto?.sku ?? ""} className={campo} />
        </Campo>
        <Campo id="ean" label="EAN / código de barras">
          <input id="ean" name="ean" defaultValue={produto?.ean ?? ""} className={campo} />
        </Campo>
        <Campo id="codigoInterno" label="Código interno">
          <input id="codigoInterno" name="codigoInterno" defaultValue={produto?.codigoInterno ?? ""} className={campo} />
        </Campo>
        <Campo id="ncm" label="NCM">
          <input id="ncm" name="ncm" defaultValue={produto?.ncm ?? ""} className={campo} />
        </Campo>
      </Bloco>

      <Bloco titulo="Características">
        <Campo id="cor" label="Cor">
          <input id="cor" name="cor" defaultValue={produto?.cor ?? ""} className={campo} />
        </Campo>
        <Campo id="capacidade" label="Capacidade">
          <input id="capacidade" name="capacidade" defaultValue={produto?.capacidade ?? ""} placeholder="128GB" className={campo} />
        </Campo>
        <Campo id="voltagem" label="Voltagem">
          <input id="voltagem" name="voltagem" defaultValue={produto?.voltagem ?? ""} placeholder="Bivolt" className={campo} />
        </Campo>
        <Campo id="garantiaMeses" label="Garantia (meses)">
          <input id="garantiaMeses" name="garantiaMeses" inputMode="numeric" defaultValue={produto?.garantiaMeses ?? ""} className={campo} />
        </Campo>
        <Campo id="compatibilidade" label="Compatibilidade" span2>
          <input
            id="compatibilidade"
            name="compatibilidade"
            defaultValue={produto?.compatibilidade ?? ""}
            placeholder="iPhone 15, iPhone 14 ou Universal"
            className={campo}
          />
        </Campo>
      </Bloco>

      <Bloco titulo="Preços e estoque">
        <Campo id="precoCusto" label="Preço de custo (R$)">
          <input id="precoCusto" name="precoCusto" inputMode="decimal" defaultValue={reais(produto?.precoCusto)} className={campo} />
        </Campo>
        <Campo id="preco" label="Preço de venda (R$) *">
          <input id="preco" name="preco" inputMode="decimal" defaultValue={reais(produto?.preco)} required className={campo} />
        </Campo>
        <Campo id="precoMinimo" label="Preço mínimo (R$)">
          <input id="precoMinimo" name="precoMinimo" inputMode="decimal" defaultValue={reais(produto?.precoMinimo)} className={campo} />
        </Campo>
        <Campo id="quantidadeMinima" label="Estoque mínimo (alerta)">
          <input id="quantidadeMinima" name="quantidadeMinima" inputMode="numeric" defaultValue={produto?.quantidadeMinima ?? 0} className={campo} />
        </Campo>
        {!produto && (
          <Campo id="quantidadeInicial" label="Quantidade inicial">
            <input id="quantidadeInicial" name="quantidadeInicial" inputMode="numeric" defaultValue="0" className={campo} />
            <p className="mt-1 text-fluid-2xs text-kyron-silver/55">
              Vira uma movimentação de entrada, com histórico.
            </p>
          </Campo>
        )}
        <Campo id="localizacao" label="Localização">
          <input id="localizacao" name="localizacao" defaultValue={produto?.localizacao ?? ""} placeholder="Prateleira A3" className={campo} />
        </Campo>
      </Bloco>

      <Bloco titulo="Descrição">
        <Campo id="descricaoCurta" label="Descrição curta (aparece na loja)" span2>
          <input id="descricaoCurta" name="descricaoCurta" defaultValue={produto?.descricaoCurta ?? ""} className={campo} />
        </Campo>
        <Campo id="observacoes" label="Observações internas" span2>
          <textarea id="observacoes" name="observacoes" rows={3} defaultValue={produto?.observacoes ?? ""} className={`${campo} resize-y`} />
        </Campo>
      </Bloco>

      <label className="flex items-center gap-fluid-xs text-fluid-sm text-kyron-silver">
        <input
          type="checkbox"
          name="ativo"
          value="on"
          defaultChecked={produto ? produto.ativo : true}
          className="h-4 w-4 accent-[#1e6bff]"
        />
        Ativo (visível na loja)
      </label>

      {estado?.erro && (
        <p role="alert" className="text-fluid-sm text-kyron-blue">
          {estado.erro}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-fluid-sm">
        <button
          type="submit"
          disabled={salvando}
          className="kyron-label rounded-kyron-sm bg-kyron-blue px-fluid-md py-fluid-sm text-fluid-xs text-white transition-all hover:-translate-y-px disabled:opacity-50"
        >
          {salvando ? "Salvando…" : produto ? "Salvar alterações" : "Cadastrar produto"}
        </button>
        <Link href="/erp/produtos" className="text-fluid-2xs text-kyron-silver hover:text-kyron-white">
          Cancelar
        </Link>
      </div>
    </form>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="kyron-label mb-fluid-sm text-fluid-2xs text-kyron-silver/70">
        {titulo}
      </legend>
      <div className="grid gap-fluid-sm sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Campo({
  id,
  label,
  children,
  span2 = false,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  span2?: boolean;
}) {
  return (
    <div className={span2 ? "sm:col-span-2" : ""}>
      <label htmlFor={id} className={rotulo}>
        {label}
      </label>
      {children}
    </div>
  );
}
