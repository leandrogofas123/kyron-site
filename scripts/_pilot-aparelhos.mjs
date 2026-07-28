// Piloto: iPhones (verso) como PNG de FUNDO TRANSPARENTE.
// Geometria proporcional ao aparelho real; câmera no canto superior esquerdo.
// Sem logotipo (marca de terceiro não é desenhada).

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "pilot");

// Corpo: proporção real do iPhone (147,6 x 71,6 mm ≈ 2,06).
const W = 300;
const H = 618;
const R = 56; // raio de canto ≈ 0,19 da largura

function lente(cx, cy, r) {
  return `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#22262e"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.86}" fill="#0a0c11"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.5}" fill="#05060a"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.26}" fill="#16203a"/>
    <circle cx="${cx - r * 0.34}" cy="${cy - r * 0.34}" r="${r * 0.15}" fill="rgba(150,180,255,0.45)"/>`;
}

function flash(cx, cy) {
  return `<circle cx="${cx}" cy="${cy}" r="10" fill="#d7dcae"/>
          <circle cx="${cx}" cy="${cy}" r="5" fill="#93a05e"/>`;
}

/** Módulo de câmera ancorado no canto superior esquerdo do corpo. */
function camera(tipo, plateau) {
  const m = 17; // margem da borda
  if (tipo === "pro3") {
    const s = 158;
    const l = 34;
    return `
      <rect x="${m}" y="${m}" width="${s}" height="${s}" rx="44"
            fill="${plateau}" stroke="rgba(255,255,255,0.09)" stroke-width="1.5"/>
      ${lente(m + 47, m + 47, l)}
      ${lente(m + 47, m + 111, l)}
      ${lente(m + 111, m + 79, l)}
      ${flash(m + 113, m + 40)}
      <circle cx="${m + 79}" cy="${m + 79}" r="5" fill="#0b0e14"/>`;
  }
  if (tipo === "diag2") {
    const s = 142;
    const l = 35;
    return `
      <rect x="${m}" y="${m}" width="${s}" height="${s}" rx="42"
            fill="${plateau}" stroke="rgba(255,255,255,0.09)" stroke-width="1.5"/>
      ${lente(m + 46, m + 46, l)}
      ${lente(m + 96, m + 96, l)}
      ${flash(m + 102, m + 42)}`;
  }
  // vert2 — iPhone 11: duas lentes empilhadas
  const s = 140;
  const l = 34;
  return `
    <rect x="${m}" y="${m}" width="${s}" height="${s}" rx="42"
          fill="${plateau}" stroke="rgba(255,255,255,0.09)" stroke-width="1.5"/>
    ${lente(m + 45, m + 44, l)}
    ${lente(m + 45, m + 98, l)}
    ${flash(m + 100, m + 71)}`;
}

function aparelho({ body, frame, plateau, cam }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 780" width="920" height="1560">
  <defs>
    <linearGradient id="sheen" x1="0" y1="0" x2="0.75" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,0.30)"/>
      <stop offset="20%" stop-color="rgba(255,255,255,0.06)"/>
      <stop offset="60%" stop-color="rgba(255,255,255,0)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.10)"/>
    </linearGradient>
  </defs>
  <g transform="translate(80 81)">
    <rect x="-7" y="-7" width="${W + 14}" height="${H + 14}" rx="${R + 7}" fill="${frame}"/>
    <rect x="0" y="0" width="${W}" height="${H}" rx="${R}" fill="${body}"/>
    <rect x="0" y="0" width="${W}" height="${H}" rx="${R}" fill="url(#sheen)"/>
    ${camera(cam, plateau)}
  </g>
</svg>`;
}

// Cores aproximadas do produto real.
const PILOTO = [
  { nome: "15pro-titanio-natural", body: "#b8b2a7", frame: "#918a7e", plateau: "#a49d92", cam: "pro3" },
  { nome: "15pro-titanio-azul", body: "#414c5a", frame: "#303945", plateau: "#39434f", cam: "pro3" },
  { nome: "15-rosa", body: "#f3d6db", frame: "#e2c2c7", plateau: "#e8cbd0", cam: "diag2" },
  { nome: "15-verde", body: "#d0dcc7", frame: "#bccbb2", plateau: "#c5d2bc", cam: "diag2" },
  { nome: "11-roxo", body: "#d3cedc", frame: "#c1bacf", plateau: "#cac4d5", cam: "vert2" },
  { nome: "11-vermelho", body: "#b81030", frame: "#900b25", plateau: "#a50e2b", cam: "vert2" },
];

async function main() {
  await mkdir(OUT, { recursive: true });
  for (const p of PILOTO) {
    const png = await sharp(Buffer.from(aparelho(p)), { density: 200 }).png().toBuffer();
    await writeFile(path.join(OUT, `${p.nome}.png`), png);
    console.log(`  ${p.nome}.png  (${(png.length / 1024).toFixed(1)} KB)`);
  }

  // Folha de contato sobre xadrez — sem distorcer (mantém proporção).
  const cw = 300, ch = 500, cols = 3, rows = 2;
  const check = `<svg xmlns="http://www.w3.org/2000/svg" width="${cols * cw}" height="${rows * ch}">
    <defs><pattern id="c" width="40" height="40" patternUnits="userSpaceOnUse">
      <rect width="40" height="40" fill="#d9dce1"/>
      <rect width="20" height="20" fill="#eef0f3"/><rect x="20" y="20" width="20" height="20" fill="#eef0f3"/>
    </pattern></defs><rect width="100%" height="100%" fill="url(#c)"/></svg>`;
  const comps = [];
  for (let i = 0; i < PILOTO.length; i++) {
    const png = await sharp(Buffer.from(aparelho(PILOTO[i])), { density: 150 })
      .resize(cw, ch, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png().toBuffer();
    comps.push({ input: png, left: (i % cols) * cw, top: Math.floor(i / cols) * ch });
  }
  await writeFile(path.join(OUT, "_contato.png"),
    await sharp(Buffer.from(check)).composite(comps).png().toBuffer());
  console.log("  _contato.png");
}

main().catch((e) => { console.error(e); process.exit(1); });
