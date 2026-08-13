"use client";

import { useEffect, useState } from "react";

/**
 * Cérebro-mapa de competências da Kyron Academy (hero da tela de login).
 *
 * Um cérebro ÚNICO e liso (sem tronco/cerebelo pendurados, sem curvas
 * drásticas), dividido em 7 regiões de competência. As regiões acendem em azul
 * conforme o domínio (ilustrativo aqui, pré-login) e, a cada ~4s, uma região é
 * destacada com o nome flutuando como um botão com sombra.
 *
 * Geometria 100% determinística (mesma saída no servidor e no cliente → sem
 * hydration mismatch). Puramente decorativo (aria oculto do conteúdo).
 */

const VB_W = 1000;
const VB_H = 620;
const AZUL = "#2f8bff";
const AZUL_CLARO = "#8fb4ff";

// ─────────────────────────── contorno do cérebro ───────────────────────────
const CX = 500, CY = 305, RX = 384, RY = 214;

function smoothClosed(pts: Array<[number, number]>): string {
  const n = pts.length;
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d + " Z";
}

function contorno(): string {
  const N = 132, pts: Array<[number, number]> = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const up = Math.max(0, -Math.sin(a));
    const down = Math.max(0, Math.sin(a));
    const bump = 1 + up * (0.022 * Math.sin(6 * a + 0.6) + 0.014 * Math.sin(9 * a + 1.4));
    const rx = RX * (1 - 0.02 * down);
    const ry = RY * (1 - 0.05 * down);
    pts.push([CX + rx * Math.cos(a) * bump, CY + ry * Math.sin(a) * bump]);
  }
  return smoothClosed(pts);
}
const BRAIN = contorno();

// ─────────────────────────── 7 regiões (dentro do cérebro) ──────────────────
const SPLIT = 305;
type Reg = {
  sig: string; nome: string; x0: number; x1: number; y0: number; y1: number;
  lx: number; ly: number; pct: number;
};
const REGS: Reg[] = [
  { sig: "FND", nome: "Fundamentos", x0: 116, x1: 374, y0: SPLIT, y1: 524, lx: 250, ly: 404, pct: 100 },
  { sig: "ATD", nome: "Atendimento", x0: 116, x1: 310, y0: 88, y1: SPLIT, lx: 214, ly: 200, pct: 100 },
  { sig: "PRD", nome: "Produtos", x0: 502, x1: 694, y0: 88, y1: SPLIT, lx: 598, ly: 192, pct: 100 },
  { sig: "VND", nome: "Vendas e Negociação", x0: 310, x1: 502, y0: 88, y1: SPLIT, lx: 406, ly: 192, pct: 55 },
  { sig: "AUT", nome: "Automação", x0: 374, x1: 626, y0: SPLIT, y1: 524, lx: 500, ly: 404, pct: 55 },
  { sig: "BNC", nome: "Processos & Bancada", x0: 626, x1: 884, y0: SPLIT, y1: 524, lx: 762, ly: 400, pct: 0 },
  { sig: "MRC", nome: "Marca & Conteúdo", x0: 694, x1: 884, y0: 88, y1: SPLIT, lx: 786, ly: 206, pct: 0 },
];

const DIVISAS = [
  `M 310 88 L 310 ${SPLIT}`, `M 502 88 L 502 ${SPLIT}`, `M 694 88 L 694 ${SPLIT}`,
  `M 116 ${SPLIT} L 884 ${SPLIT}`, `M 374 ${SPLIT} L 374 524`, `M 626 ${SPLIT} L 626 524`,
];

// sulcos suaves determinísticos
const SULCOS: string[] = [];
for (let i = 0; i < 24; i++) {
  const yy = 122 + i * 16 + (i % 2) * 6;
  const amp = 8 + (i % 4) * 3, ph = i * 0.7;
  let d = `M 150 ${yy}`;
  for (let x = 150; x <= 850; x += 40) d += ` Q ${x + 20} ${(yy + Math.sin(x / 70 + ph) * amp).toFixed(1)} ${x + 40} ${yy}`;
  SULCOS.push(d);
}

export function CerebroKyron() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % REGS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const ativo = REGS[i];
  // rótulo-botão flutuante do destaque
  const nome = ativo.nome.toUpperCase();
  const boxW = Math.max(150, nome.length * 10.5 + 46);
  const lx = Math.max(8, Math.min(VB_W - boxW - 8, ativo.lx - boxW / 2));
  const ly = Math.max(6, ativo.ly - (ativo.y0 < SPLIT ? 96 : 92));

  return (
    <svg
      className="cerebro-svg"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      role="img"
      aria-label="Mapa de competências da Kyron Academy"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <clipPath id="cerBrain"><path d={BRAIN} /></clipPath>
        <linearGradient id="cerAz" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#1247b0" />
          <stop offset="1" stopColor="#3B84FF" />
        </linearGradient>
        <radialGradient id="cerHalo" cx="46%" cy="40%" r="70%">
          <stop offset="0" stopColor="#12233b" />
          <stop offset="1" stopColor="#0a0f18" />
        </radialGradient>
        <filter id="cerGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <ellipse cx={CX} cy={CY} rx={RX + 40} ry={RY + 40} fill={AZUL} opacity="0.05" />
      <path d={BRAIN} fill="url(#cerHalo)" />

      {/* preenchimentos por região (recortados no cérebro) */}
      <g clipPath="url(#cerBrain)">
        {REGS.map((r) => (
          <rect key={`b${r.sig}`} x={r.x0} y={r.y0} width={r.x1 - r.x0} height={r.y1 - r.y0}
            fill="#2a2e37" fillOpacity="0.9" />
        ))}
        {REGS.map((r) => {
          const h = (r.y1 - r.y0) * r.pct / 100;
          return h > 0 ? (
            <rect key={`f${r.sig}`} x={r.x0} y={r.y1 - h} width={r.x1 - r.x0} height={h}
              fill="url(#cerAz)" fillOpacity={i === REGS.indexOf(r) ? 1 : 0.82} />
          ) : null;
        })}
        {/* destaque da região ativa */}
        <rect x={ativo.x0} y={ativo.y0} width={ativo.x1 - ativo.x0} height={ativo.y1 - ativo.y0}
          fill={AZUL} fillOpacity="0.16" />
        {/* sulcos */}
        <g fill="none" stroke="#0b0f16" strokeOpacity="0.5" strokeWidth="1.3" strokeLinecap="round">
          {SULCOS.map((d, k) => <path key={k} d={d} />)}
        </g>
        {/* divisas (groove) */}
        <g fill="none" stroke="#080b11" strokeWidth="6" strokeLinecap="round">
          {DIVISAS.map((d, k) => <path key={k} d={d} />)}
        </g>
        <g fill="none" stroke="#4a5262" strokeWidth="1.4">
          {DIVISAS.map((d, k) => <path key={k} d={d} />)}
        </g>
      </g>

      {/* contorno */}
      <path d={BRAIN} fill="none" stroke="#6b7484" strokeWidth="2.6" />

      {/* siglas */}
      {REGS.map((r, k) => (
        <text key={r.sig} x={r.lx} y={r.ly} textAnchor="middle"
          fontFamily="ui-monospace, monospace" fontSize="18" fontWeight="700"
          letterSpacing="1.6" fill={k === i ? "#ffffff" : "#8ea3c4"} opacity={r.pct > 0 || k === i ? 0.95 : 0.5}>
          {r.sig}
        </text>
      ))}

      {/* destaque animado: anel pulsante + rótulo-botão */}
      <g key={i} className="cerebro-callout">
        <g className="cerebro-hex" filter="url(#cerGlow)">
          <circle cx={ativo.lx} cy={ativo.ly - 6} r="6" fill={AZUL} />
        </g>
        <circle className="cerebro-pulso" cx={ativo.lx} cy={ativo.ly - 6} r="10" fill="none"
          stroke={AZUL_CLARO} strokeWidth="2" />
        <g className="cerebro-pill">
          <rect x={lx} y={ly} width={boxW} height="58" rx="13" fill="#0e1826"
            stroke="rgba(47,139,255,0.55)" strokeWidth="1.3" />
          <rect x={lx + 12} y={ly + 12} width="4" height="34" rx="2" fill={AZUL} />
          <text x={lx + 26} y={ly + 24} fill={AZUL_CLARO} fontFamily="ui-monospace, monospace"
            fontSize="10" fontWeight="700" letterSpacing="2">COMPETÊNCIA</text>
          <text x={lx + 26} y={ly + 44} fill="#ffffff" fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontSize="17" fontWeight="700">{ativo.nome}</text>
        </g>
      </g>

      {/* indicador */}
      <g transform={`translate(${CX - (REGS.length - 1) * 9}, 574)`}>
        {REGS.map((_, k) => (
          <circle key={k} cx={k * 18} cy="0" r={k === i ? 4.5 : 3}
            fill={k === i ? AZUL : "rgba(150,175,210,0.28)"} />
        ))}
      </g>
    </svg>
  );
}
