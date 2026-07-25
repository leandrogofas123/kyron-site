// Gera as ilustrações de produto de exemplo da Kyron.
//
// Cada produto é um SVG 800x800 com fundo dark da marca, renderizado para WebP
// ~1200px via sharp (mesmo pipeline do upload real). Saída em public/exemplos/.
//
// Rodar:  node scripts/gerar-ilustracoes.mjs [--png]
//   --png  também grava PNGs em scripts/_preview/ para inspeção visual.
//
// A ARTE é a fonte única aqui. O mockup HTML espelha estes mesmos símbolos.

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(__dirname, "..");
const SAIDA = path.join(RAIZ, "public", "exemplos");
const PREVIEW = path.join(__dirname, "_preview");
const PNG = process.argv.includes("--png");

// Gradientes/definições compartilhadas (idênticas ao mockup).
const DEFS = `
  <radialGradient id="bg" cx="50%" cy="42%" r="72%">
    <stop offset="0%" stop-color="#1b1e25"/><stop offset="55%" stop-color="#101217"/><stop offset="100%" stop-color="#090a0e"/>
  </radialGradient>
  <radialGradient id="rim" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="rgba(30,107,255,0.42)"/><stop offset="70%" stop-color="rgba(30,107,255,0.10)"/><stop offset="100%" stop-color="rgba(30,107,255,0)"/>
  </radialGradient>
  <linearGradient id="alu" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#eef0f3"/><stop offset="42%" stop-color="#c3c8d0"/><stop offset="72%" stop-color="#9aa0a9"/><stop offset="100%" stop-color="#7a8089"/>
  </linearGradient>
  <linearGradient id="aluV" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#e9ecf0"/><stop offset="50%" stop-color="#b7bcc5"/><stop offset="100%" stop-color="#868c95"/>
  </linearGradient>
  <linearGradient id="titan" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#6d7178"/><stop offset="50%" stop-color="#43474e"/><stop offset="100%" stop-color="#2b2e34"/>
  </linearGradient>
  <linearGradient id="midnight" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#2b3550"/><stop offset="55%" stop-color="#1a2033"/><stop offset="100%" stop-color="#10131f"/>
  </linearGradient>
  <linearGradient id="glass" x1="0" y1="0" x2="0.6" y2="1">
    <stop offset="0%" stop-color="#15171e"/><stop offset="100%" stop-color="#05060a"/>
  </linearGradient>
  <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="rgba(244,245,247,0.55)"/><stop offset="18%" stop-color="rgba(244,245,247,0.05)"/><stop offset="100%" stop-color="rgba(244,245,247,0)"/>
  </linearGradient>
  <linearGradient id="blueStreak" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="rgba(30,107,255,0)"/><stop offset="55%" stop-color="rgba(30,107,255,0.35)"/><stop offset="100%" stop-color="rgba(30,107,255,0)"/>
  </linearGradient>
  <radialGradient id="floor" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="rgba(0,0,0,0.55)"/><stop offset="100%" stop-color="rgba(0,0,0,0)"/>
  </radialGradient>
  <linearGradient id="mesh" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#3a3f47"/><stop offset="100%" stop-color="#22262d"/>
  </linearGradient>
`;

// Conteúdo de cada produto (sem o <rect> de fundo, que é comum a todos).
const PRODUTOS = {
  "iphone-novo": `
    <circle cx="400" cy="380" r="230" fill="url(#rim)"/>
    <ellipse cx="400" cy="648" rx="150" ry="30" fill="url(#floor)"/>
    <rect x="286" y="170" width="228" height="470" rx="52" fill="url(#titan)"/>
    <rect x="296" y="180" width="208" height="450" rx="44" fill="url(#glass)"/>
    <rect x="296" y="180" width="208" height="450" rx="44" fill="url(#blueStreak)" opacity="0.5"/>
    <rect x="366" y="202" width="68" height="17" rx="8.5" fill="#0a0b0f"/>
    <path d="M296 224 L296 500 Q296 224 372 190 Z" fill="url(#sheen)" opacity="0.5"/>`,

  "iphone-seminovo": `
    <circle cx="400" cy="380" r="230" fill="url(#rim)"/>
    <ellipse cx="400" cy="648" rx="150" ry="30" fill="url(#floor)"/>
    <rect x="286" y="170" width="228" height="470" rx="52" fill="url(#midnight)"/>
    <rect x="286" y="170" width="228" height="470" rx="52" fill="none" stroke="rgba(244,245,247,0.10)" stroke-width="2"/>
    <rect x="300" y="188" width="132" height="132" rx="34" fill="#0d1017" stroke="rgba(244,245,247,0.08)" stroke-width="2"/>
    <circle cx="342" cy="230" r="27" fill="#05060a" stroke="rgba(201,205,212,0.35)" stroke-width="3"/>
    <circle cx="342" cy="230" r="12" fill="#11151f"/>
    <circle cx="392" cy="278" r="27" fill="#05060a" stroke="rgba(201,205,212,0.35)" stroke-width="3"/>
    <circle cx="392" cy="278" r="12" fill="#11151f"/>
    <circle cx="342" cy="278" r="9" fill="#0a0d14"/>
    <circle cx="400" cy="410" r="26" fill="none" stroke="rgba(201,205,212,0.22)" stroke-width="3"/>
    <path d="M300 210 L300 470 Q300 210 380 186 Z" fill="url(#sheen)" opacity="0.28"/>`,

  "ipad": `
    <circle cx="400" cy="380" r="240" fill="url(#rim)"/>
    <ellipse cx="400" cy="656" rx="180" ry="30" fill="url(#floor)"/>
    <rect x="238" y="158" width="324" height="454" rx="34" fill="url(#titan)"/>
    <rect x="252" y="172" width="296" height="426" rx="22" fill="url(#glass)"/>
    <rect x="252" y="172" width="296" height="426" rx="22" fill="url(#blueStreak)" opacity="0.4"/>
    <path d="M252 210 L252 470 Q252 200 340 180 Z" fill="url(#sheen)" opacity="0.4"/>`,

  "watch": `
    <circle cx="400" cy="400" r="220" fill="url(#rim)"/>
    <ellipse cx="400" cy="648" rx="120" ry="26" fill="url(#floor)"/>
    <path d="M348 150 Q352 210 360 250 L440 250 Q448 210 452 150 Z" fill="url(#titan)"/>
    <path d="M360 550 Q352 590 348 650 L452 650 Q448 590 440 550 Z" fill="url(#titan)"/>
    <rect x="300" y="248" width="200" height="304" rx="60" fill="url(#aluV)"/>
    <rect x="316" y="266" width="168" height="268" rx="46" fill="url(#glass)"/>
    <rect x="336" y="292" width="128" height="216" rx="30" fill="#0a0d14"/>
    <circle cx="400" cy="360" r="30" fill="none" stroke="rgba(30,107,255,0.6)" stroke-width="5"/>
    <rect x="384" y="440" width="32" height="7" rx="3.5" fill="rgba(201,205,212,0.5)"/>
    <rect x="500" y="330" width="18" height="60" rx="9" fill="url(#alu)"/>
    <path d="M316 300 L316 470 Q316 280 400 272 Z" fill="url(#sheen)" opacity="0.35"/>`,

  "airpods": `
    <circle cx="400" cy="410" r="220" fill="url(#rim)"/>
    <ellipse cx="400" cy="632" rx="150" ry="28" fill="url(#floor)"/>
    <g transform="translate(430 300)">
      <rect x="0" y="0" width="196" height="150" rx="40" fill="url(#aluV)"/>
      <rect x="0" y="66" width="196" height="10" fill="rgba(0,0,0,0.16)"/>
      <circle cx="98" cy="40" r="7" fill="rgba(30,107,255,0.85)"/>
      <path d="M14 20 L14 120 Q14 8 90 6 Z" fill="url(#sheen)" opacity="0.5"/>
    </g>
    <g transform="translate(196 232)">
      <path d="M60 0 Q104 0 104 60 Q104 96 78 108 L70 250 Q66 286 40 286 Q14 286 12 250 L20 150 Q0 130 0 72 Q0 6 60 0 Z" fill="url(#aluV)"/>
      <circle cx="52" cy="66" r="30" fill="#0b0e14"/>
      <path d="M20 24 L14 150 Q6 40 44 14 Z" fill="url(#sheen)" opacity="0.45"/>
    </g>`,

  "camera-wifi": `
    <circle cx="400" cy="360" r="220" fill="url(#rim)"/>
    <ellipse cx="400" cy="656" rx="150" ry="30" fill="url(#floor)"/>
    <rect x="352" y="560" width="96" height="30" rx="12" fill="url(#alu)"/>
    <rect x="386" y="470" width="28" height="100" fill="url(#aluV)"/>
    <circle cx="400" cy="378" r="150" fill="url(#aluV)"/>
    <circle cx="400" cy="378" r="150" fill="none" stroke="rgba(0,0,0,0.18)" stroke-width="2"/>
    <ellipse cx="400" cy="378" rx="108" ry="120" fill="#0c0f16"/>
    <circle cx="400" cy="368" r="60" fill="#05060a" stroke="rgba(30,107,255,0.55)" stroke-width="4"/>
    <circle cx="400" cy="368" r="34" fill="#11151f"/>
    <circle cx="400" cy="368" r="14" fill="#1d2740"/>
    <circle cx="418" cy="352" r="7" fill="rgba(244,245,247,0.6)"/>
    <circle cx="400" cy="452" r="5" fill="rgba(30,107,255,0.9)"/>
    <path d="M300 300 Q330 250 400 244 Q330 270 306 340 Z" fill="url(#sheen)" opacity="0.5"/>`,

  "fechadura": `
    <circle cx="400" cy="380" r="220" fill="url(#rim)"/>
    <ellipse cx="400" cy="648" rx="120" ry="28" fill="url(#floor)"/>
    <rect x="300" y="150" width="200" height="500" rx="46" fill="url(#titan)"/>
    <rect x="312" y="162" width="176" height="476" rx="38" fill="#0e1118"/>
    <g fill="rgba(201,205,212,0.75)">
      <circle cx="360" cy="250" r="13"/><circle cx="400" cy="250" r="13"/><circle cx="440" cy="250" r="13"/>
      <circle cx="360" cy="300" r="13"/><circle cx="400" cy="300" r="13"/><circle cx="440" cy="300" r="13"/>
      <circle cx="360" cy="350" r="13"/><circle cx="400" cy="350" r="13"/><circle cx="440" cy="350" r="13"/>
    </g>
    <circle cx="400" cy="470" r="46" fill="#05060a" stroke="rgba(30,107,255,0.6)" stroke-width="4"/>
    <g fill="none" stroke="rgba(30,107,255,0.8)" stroke-width="3" stroke-linecap="round">
      <path d="M382 470 Q400 452 418 470"/><path d="M386 482 Q400 466 414 482"/><path d="M390 492 Q400 480 410 492"/>
    </g>
    <rect x="360" y="560" width="80" height="42" rx="12" fill="url(#alu)"/>
    <path d="M312 200 L312 430 Q312 180 400 172 Z" fill="url(#sheen)" opacity="0.2"/>`,

  "fone": `
    <circle cx="400" cy="400" r="230" fill="url(#rim)"/>
    <ellipse cx="400" cy="650" rx="150" ry="28" fill="url(#floor)"/>
    <path d="M214 430 Q214 190 400 190 Q586 190 586 430" fill="none" stroke="url(#alu)" stroke-width="34" stroke-linecap="round"/>
    <path d="M214 400 Q214 200 400 198" fill="none" stroke="rgba(244,245,247,0.3)" stroke-width="6" stroke-linecap="round"/>
    <rect x="176" y="398" width="104" height="150" rx="42" fill="url(#aluV)"/>
    <ellipse cx="228" cy="473" rx="34" ry="52" fill="#0c0f16"/>
    <rect x="520" y="398" width="104" height="150" rx="42" fill="url(#aluV)"/>
    <ellipse cx="572" cy="473" rx="34" ry="52" fill="#0c0f16"/>
    <circle cx="572" cy="473" r="12" fill="none" stroke="rgba(30,107,255,0.6)" stroke-width="3"/>`,

  "caixa-som": `
    <circle cx="400" cy="400" r="220" fill="url(#rim)"/>
    <ellipse cx="400" cy="646" rx="130" ry="28" fill="url(#floor)"/>
    <path d="M300 250 Q300 236 314 234 L486 234 Q500 236 500 250 L500 560 Q500 588 400 588 Q300 588 300 560 Z" fill="url(#mesh)"/>
    <ellipse cx="400" cy="250" rx="100" ry="22" fill="#2a2f37"/>
    <ellipse cx="400" cy="248" rx="72" ry="14" fill="#0d1017"/>
    <circle cx="400" cy="248" r="30" fill="none" stroke="rgba(30,107,255,0.65)" stroke-width="4"/>
    <g fill="rgba(0,0,0,0.22)">
      <rect x="322" y="286" width="156" height="3"/><rect x="316" y="330" width="168" height="3"/>
      <rect x="314" y="374" width="172" height="3"/><rect x="314" y="418" width="172" height="3"/>
      <rect x="316" y="462" width="168" height="3"/><rect x="322" y="506" width="156" height="3"/>
    </g>
    <path d="M316 270 L316 520 Q316 250 360 244 Z" fill="url(#sheen)" opacity="0.25"/>`,

  "acessorio": `
    <circle cx="360" cy="360" r="210" fill="url(#rim)"/>
    <ellipse cx="400" cy="636" rx="150" ry="28" fill="url(#floor)"/>
    <rect x="250" y="250" width="200" height="200" rx="52" fill="url(#aluV)"/>
    <rect x="250" y="250" width="200" height="200" rx="52" fill="none" stroke="rgba(0,0,0,0.12)" stroke-width="2"/>
    <rect x="330" y="214" width="16" height="40" rx="4" fill="#8a9099"/>
    <rect x="360" y="214" width="16" height="40" rx="4" fill="#8a9099"/>
    <circle cx="350" cy="350" r="26" fill="#0c0f16"/>
    <circle cx="350" cy="350" r="10" fill="#1d2740"/>
    <path d="M262 280 L262 420 Q262 262 330 258 Z" fill="url(#sheen)" opacity="0.45"/>
    <path d="M450 350 Q560 350 560 470 Q560 560 470 560" fill="none" stroke="url(#alu)" stroke-width="16" stroke-linecap="round"/>
    <rect x="452" y="520" width="40" height="72" rx="12" fill="url(#aluV)" transform="rotate(12 472 556)"/>`,
};

function svgDe(conteudo) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="1200" height="1200">
  <defs>${DEFS}</defs>
  <rect width="800" height="800" fill="url(#bg)"/>
  ${conteudo}
</svg>`;
}

async function main() {
  await mkdir(SAIDA, { recursive: true });
  if (PNG) await mkdir(PREVIEW, { recursive: true });

  for (const [nome, conteudo] of Object.entries(PRODUTOS)) {
    const svg = Buffer.from(svgDe(conteudo));
    const base = sharp(svg, { density: 200 });

    const webp = await base.clone().webp({ quality: 88 }).toBuffer();
    await writeFile(path.join(SAIDA, `${nome}.webp`), webp);

    if (PNG) {
      const png = await base.clone().png().toBuffer();
      await writeFile(path.join(PREVIEW, `${nome}.png`), png);
    }
    console.log(`  ${nome}.webp  (${(webp.length / 1024).toFixed(1)} KB)`);
  }
  console.log(`\nPronto: ${Object.keys(PRODUTOS).length} ilustrações em public/exemplos/`);
}

main().catch((e) => { console.error(e); process.exit(1); });
