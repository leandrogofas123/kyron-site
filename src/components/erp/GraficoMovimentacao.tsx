"use client";

import { useState } from "react";

/**
 * Entradas × saídas por dia (barras agrupadas).
 *
 * Cores validadas contra a superfície escura da Kyron (#14161B):
 * azul da marca #1E6BFF e âmbar #C97B10 — separação CVD ΔE 33 (protan),
 * bem acima do piso exigido. Identidade nunca fica só na cor: há legenda,
 * rótulo no hover e uma tabela equivalente logo abaixo.
 */

const COR_ENTRADA = "#1E6BFF";
const COR_SAIDA = "#C97B10";

export type PontoGrafico = {
  dia: string;
  rotulo: string;
  entradas: number;
  saidas: number;
};

/* Sistema de coordenadas em pixels reais e escala uniforme (sem
   preserveAspectRatio="none"): as pontas arredondadas de 4px e o respiro de
   2px entre as barras mantêm a proporção em qualquer largura. */
const LARGURA = 700;
const ALTURA = 168;
const TOPO = 8;
const BASE = ALTURA - 22; // espaço para os rótulos do eixo
const RAIO = 4;
const GAP = 2; // respiro de superfície entre as barras do par

export function GraficoMovimentacao({ dados }: { dados: PontoGrafico[] }) {
  const [ativo, setAtivo] = useState<number | null>(null);

  const maximo = Math.max(1, ...dados.flatMap((d) => [d.entradas, d.saidas]));
  const passo = LARGURA / Math.max(1, dados.length);
  // Marcas finas: metade do passo, descontando o respiro do par e das colunas.
  const larguraBarra = Math.max(4, Math.min(20, passo / 2 - GAP));

  const alturaDe = (v: number) => ((BASE - TOPO) * v) / maximo;

  const temDados = dados.some((d) => d.entradas > 0 || d.saidas > 0);

  return (
    <div>
      {/* Legenda — identidade nunca só pela cor */}
      <div className="mb-fluid-sm flex flex-wrap items-center gap-fluid-md">
        <Chave cor={COR_ENTRADA} label="Entradas" />
        <Chave cor={COR_SAIDA} label="Saídas" />
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${LARGURA} ${ALTURA}`}
          role="img"
          aria-label={`Movimentação de estoque dos últimos ${dados.length} dias`}
          /* minHeight: em telas estreitas a escala uniforme deixaria o gráfico
             baixo demais (~70px); o mínimo mantém as barras legíveis. */
          className="block w-full"
          style={{ minHeight: 120 }}
        >
          {/* Grade recessiva */}
          {[0, 0.5, 1].map((f) => (
            <line
              key={f}
              x1="0"
              x2={LARGURA}
              y1={BASE - (BASE - TOPO) * f}
              y2={BASE - (BASE - TOPO) * f}
              stroke="var(--kyron-hairline)"
              strokeWidth="0.4"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {dados.map((d, i) => {
            const centro = i * passo + passo / 2;
            const xEntrada = centro - larguraBarra - GAP / 2;
            const xSaida = centro + GAP / 2;
            return (
              <g
                key={d.dia}
                onMouseEnter={() => setAtivo(i)}
                onMouseLeave={() => setAtivo(null)}
              >
                {/* Alvo de hover maior que a marca */}
                <rect
                  x={i * passo}
                  y={TOPO}
                  width={passo}
                  height={BASE - TOPO}
                  fill={ativo === i ? "rgba(255,255,255,0.04)" : "transparent"}
                />
                <Barra x={xEntrada} largura={larguraBarra} altura={alturaDe(d.entradas)} cor={COR_ENTRADA} />
                <Barra x={xSaida} largura={larguraBarra} altura={alturaDe(d.saidas)} cor={COR_SAIDA} />
              </g>
            );
          })}

          {/* Eixo — rótulos alternados para não colidir */}
          {dados.map((d, i) =>
            i % 2 === 0 || dados.length <= 8 ? (
              <text
                key={d.dia}
                x={i * passo + passo / 2}
                y={ALTURA - 6}
                textAnchor="middle"
                fill="var(--kyron-silver)"
                opacity="0.55"
                style={{ fontSize: "11px" }}
              >
                {d.rotulo}
              </text>
            ) : null,
          )}
        </svg>

        {/* Tooltip */}
        {ativo != null && (
          <div
            className="pointer-events-none absolute top-0 rounded-kyron-sm border border-[var(--kyron-hairline-strong)] bg-kyron-black px-3 py-2 text-fluid-2xs shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
            style={{
              left: `${((ativo + 0.5) / dados.length) * 100}%`,
              transform: "translateX(-50%)",
            }}
          >
            <p className="text-kyron-white">{dados[ativo].rotulo}</p>
            <p className="mt-1 flex items-center gap-1.5 text-kyron-silver">
              <Ponto cor={COR_ENTRADA} /> Entradas: {dados[ativo].entradas}
            </p>
            <p className="flex items-center gap-1.5 text-kyron-silver">
              <Ponto cor={COR_SAIDA} /> Saídas: {dados[ativo].saidas}
            </p>
          </div>
        )}
      </div>

      {!temDados && (
        <p className="mt-fluid-sm text-fluid-2xs text-kyron-silver/55">
          Sem movimentações no período — o gráfico se preenche conforme o
          estoque é movimentado.
        </p>
      )}

      {/* Alternativa em tabela (acessibilidade) */}
      <details className="mt-fluid-sm">
        <summary className="cursor-pointer text-fluid-2xs text-kyron-silver/60 hover:text-kyron-silver">
          Ver como tabela
        </summary>
        <table className="mt-fluid-xs w-full border-collapse text-fluid-2xs">
          <thead>
            <tr className="border-b border-[var(--kyron-hairline)] text-left text-kyron-silver/60">
              <th className="py-1 font-normal">Dia</th>
              <th className="py-1 text-right font-normal">Entradas</th>
              <th className="py-1 text-right font-normal">Saídas</th>
            </tr>
          </thead>
          <tbody>
            {dados.map((d) => (
              <tr key={d.dia} className="border-b border-[var(--kyron-hairline)]">
                <td className="py-1 text-kyron-silver">{d.rotulo}</td>
                <td className="py-1 text-right text-kyron-white">{d.entradas}</td>
                <td className="py-1 text-right text-kyron-white">{d.saidas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}

/** Barra fina com extremidade arredondada, ancorada na base. */
function Barra({
  x,
  largura,
  altura,
  cor,
}: {
  x: number;
  largura: number;
  altura: number;
  cor: string;
}) {
  if (altura <= 0) return null;
  const y = BASE - altura;
  const r = Math.min(RAIO, largura / 2, altura);
  return (
    <path
      d={`M ${x} ${BASE} L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} L ${x + largura - r} ${y} Q ${x + largura} ${y} ${x + largura} ${y + r} L ${x + largura} ${BASE} Z`}
      fill={cor}
    />
  );
}

function Chave({ cor, label }: { cor: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-fluid-2xs text-kyron-silver">
      <Ponto cor={cor} />
      {label}
    </span>
  );
}

function Ponto({ cor }: { cor: string }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-2 w-2 shrink-0 rounded-full"
      style={{ backgroundColor: cor }}
    />
  );
}
