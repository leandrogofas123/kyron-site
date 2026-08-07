"use client";

import { useEffect, useState } from "react";

/**
 * Cérebro-mapa de competências da Kyron Academy.
 *
 * Um cérebro (visão superior) desenhado como um "mapa" dividido em células
 * ("estados"), ~30% preenchidas. A cada 5s destaca uma competência do lado
 * direito, em azul, com uma seta para fora e um rótulo em formato de botão.
 * Toda a geometria é determinística — mesma saída no servidor e no cliente,
 * sem risco de hydration mismatch. Puramente decorativo (aria-hidden).
 */

const VB_W = 1000;
const VB_H = 720;

const AZUL = "#2f8bff";
const AZUL_CLARO = "#7cb8ff";

// ─────────────────────────── contorno do cérebro ───────────────────────────

function contornoCerebro(): string {
  const cx = 372;
  const cy = 356;
  const rx = 250;
  const ry = 298;
  const N = 132;
  const pts: Array<[number, number]> = [];

  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2; // 0=direita, π/2=baixo, π=esq, 3π/2=topo
    const m =
      1 +
      0.05 * Math.sin(6 * a + 0.7) +
      0.03 * Math.sin(10 * a + 2.1) +
      0.018 * Math.sin(15 * a);

    const baixo = Math.max(0, Math.sin(a));
    const topo = Math.max(0, -Math.sin(a));
    const RX = rx * (1 - 0.17 * baixo * baixo) * (1 - 0.03 * topo);
    const RY = ry * (1 - 0.04 * baixo);

    let px = cx + RX * m * Math.cos(a);
    let py = cy + RY * m * Math.sin(a);

    // Fenda frontal (entre hemisférios) no topo-centro.
    let d = Math.abs(a - (3 * Math.PI) / 2);
    d = Math.min(d, Math.abs(d - Math.PI * 2));
    if (d < 0.36) py += 34 * Math.exp(-Math.pow(d / 0.17, 2));

    pts.push([px, py]);
  }

  // Catmull-Rom fechado → cúbicas de Bézier (contorno orgânico e suave).
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < N; i++) {
    const p0 = pts[(i - 1 + N) % N];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % N];
    const p3 = pts[(i + 2) % N];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d + " Z";
}

const BRAIN_D = contornoCerebro();

// ────────────────────────── células ("estados") ──────────────────────────

function hexPontos(cx: number, cy: number, r: number): string {
  const p: string[] = [];
  for (let k = 0; k < 6; k++) {
    const ang = (Math.PI / 180) * (60 * k);
    p.push(`${(cx + r * Math.cos(ang)).toFixed(1)},${(cy + r * Math.sin(ang)).toFixed(1)}`);
  }
  return p.join(" ");
}

type Celula = { pts: string; preenchida: boolean; key: string };

function gerarCelulas(): Celula[] {
  const R = 30;
  const colStep = 1.5 * R;
  const rowStep = Math.sqrt(3) * R;
  const out: Celula[] = [];
  let col = 0;
  for (let x = 116; x <= 640; x += colStep, col++) {
    const yOff = col % 2 ? rowStep / 2 : 0;
    let row = 0;
    for (let y = 74 + yOff; y <= 648; y += rowStep, row++) {
      const preenchida = (col * 5 + row * 7) % 10 < 3; // ~30%
      out.push({ pts: hexPontos(x, y, R - 2.5), preenchida, key: `${col}-${row}` });
    }
  }
  return out;
}

const CELULAS = gerarCelulas();

// ───────────────────────────── competências ─────────────────────────────

type Skill = { label: string; ax: number; ay: number };

const SKILLS: Skill[] = [
  { label: "Técnicas de vendas", ax: 520, ay: 172 },
  { label: "Inteligência emocional", ax: 592, ay: 272 },
  { label: "Marketing pessoal", ax: 612, ay: 380 },
  { label: "Negociação", ax: 582, ay: 482 },
  { label: "Comunicação persuasiva", ax: 508, ay: 566 },
];

const HEX_ATIVO = 26; // raio do estado destacado

export function CerebroKyron() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % SKILLS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const s = SKILLS[i];
  const boxW = 300;
  const boxH = 66;
  const lx = 668;
  const lcy = Math.max(70, Math.min(VB_H - 70, s.ay));
  const ly = lcy - boxH / 2;
  const sx = s.ax + HEX_ATIVO + 6;

  return (
    <svg
      className="cerebro-svg"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      role="img"
      aria-label="Mapa de competências da Kyron Academy"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id="cerMassa" cx="42%" cy="40%" r="75%">
          <stop offset="0%" stopColor="#12233b" />
          <stop offset="55%" stopColor="#0c1826" />
          <stop offset="100%" stopColor="#070f19" />
        </radialGradient>
        <linearGradient id="cerBorda" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4f80c0" />
          <stop offset="100%" stopColor="#22405f" />
        </linearGradient>
        <marker
          id="cerSeta"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 z" fill={AZUL} />
        </marker>
        <clipPath id="cerClip">
          <path d={BRAIN_D} />
        </clipPath>
        <filter id="cerGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="7" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* halo ambiente */}
      <ellipse cx="372" cy="352" rx="330" ry="360" fill={AZUL} opacity="0.05" />

      {/* massa do cérebro */}
      <path d={BRAIN_D} fill="url(#cerMassa)" />

      {/* mapa: células ("estados"), ~30% preenchidas — recortadas no cérebro */}
      <g clipPath="url(#cerClip)">
        {CELULAS.map((c) => (
          <polygon
            key={c.key}
            points={c.pts}
            fill={c.preenchida ? "rgba(47,139,255,0.16)" : "rgba(150,175,210,0.028)"}
            stroke={c.preenchida ? "rgba(124,184,255,0.34)" : "rgba(140,165,200,0.10)"}
            strokeWidth="1"
          />
        ))}
        {/* fenda inter-hemisférios */}
        <path
          d="M 372 96 C 366 210, 380 300, 372 430 C 368 500, 374 540, 372 560"
          fill="none"
          stroke="rgba(120,160,210,0.22)"
          strokeWidth="2.5"
        />
        {/* alguns sulcos sutis */}
        <path d="M 250 200 C 300 230, 300 280, 250 320" fill="none" stroke="rgba(120,160,210,0.14)" strokeWidth="2" />
        <path d="M 470 210 C 430 250, 440 300, 495 330" fill="none" stroke="rgba(120,160,210,0.14)" strokeWidth="2" />
        <path d="M 250 430 C 300 450, 310 500, 260 520" fill="none" stroke="rgba(120,160,210,0.12)" strokeWidth="2" />
        <path d="M 470 440 C 430 470, 445 510, 500 520" fill="none" stroke="rgba(120,160,210,0.12)" strokeWidth="2" />
      </g>

      {/* contorno */}
      <path d={BRAIN_D} fill="none" stroke="url(#cerBorda)" strokeWidth="2.4" opacity="0.85" />

      {/* ── competência em destaque (troca a cada 5s) ── */}
      <g key={i} className="cerebro-callout">
        {/* seta para fora */}
        <path
          d={`M ${sx} ${s.ay} C ${sx + 46} ${s.ay}, ${lx - 52} ${lcy}, ${lx - 10} ${lcy}`}
          fill="none"
          stroke={AZUL}
          strokeWidth="2.4"
          markerEnd="url(#cerSeta)"
          opacity="0.9"
        />

        {/* estado destacado */}
        <g className="cerebro-hex" filter="url(#cerGlow)">
          <polygon points={hexPontos(s.ax, s.ay, HEX_ATIVO)} fill={AZUL} opacity="0.9" />
          <polygon
            points={hexPontos(s.ax, s.ay, HEX_ATIVO)}
            fill="none"
            stroke={AZUL_CLARO}
            strokeWidth="2"
          />
        </g>
        <polygon
          className="cerebro-pulso"
          points={hexPontos(s.ax, s.ay, HEX_ATIVO)}
          fill="none"
          stroke={AZUL_CLARO}
          strokeWidth="2"
        />

        {/* rótulo em formato de botão (com sombra) */}
        <g className="cerebro-pill">
          <rect x={lx} y={ly} width={boxW} height={boxH} rx="14" fill="#0e1826" stroke="rgba(47,139,255,0.55)" strokeWidth="1.4" />
          <rect x={lx + 12} y={ly + 14} width="4" height={boxH - 28} rx="2" fill={AZUL} />
          <text x={lx + 28} y={ly + 27} fill={AZUL_CLARO} fontSize="11" fontWeight="700" letterSpacing="2.2" style={{ textTransform: "uppercase" }}>
            Competência em foco
          </text>
          <text x={lx + 28} y={ly + 49} fill="#ffffff" fontSize="20" fontWeight="700" letterSpacing="0.2">
            {s.label}
          </text>
          <circle cx={lx + boxW - 26} cy={lcy} r="14" fill="rgba(47,139,255,0.16)" stroke="rgba(47,139,255,0.5)" strokeWidth="1.2" />
          <path d={`M ${lx + boxW - 30} ${lcy - 6} L ${lx + boxW - 20} ${lcy} L ${lx + boxW - 30} ${lcy + 6}`} fill="none" stroke={AZUL_CLARO} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>

      {/* indicador de progresso */}
      <g transform={`translate(${372 - (SKILLS.length - 1) * 9}, 690)`}>
        {SKILLS.map((_, k) => (
          <circle
            key={k}
            cx={k * 18}
            cy="0"
            r={k === i ? 4.5 : 3}
            fill={k === i ? AZUL : "rgba(150,175,210,0.28)"}
          />
        ))}
      </g>
    </svg>
  );
}
