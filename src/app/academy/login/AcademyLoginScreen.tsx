"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

import { AcademyTemaToggle } from "@/components/academy/AcademyTemaToggle";

import { AcademyAuth } from "./AcademyAuth";

/**
 * Tela de login da Academy — reprodução fiel do modelo "Redesign Kyron
 * Academy login": painel de acesso que se abre por cima de uma vitrine
 * giratória do que o aluno vai aprender. Fechado por padrão: o visitante vê
 * a proposta de valor primeiro; a aba "ENTRAR" (ou um erro de OAuth vindo da
 * URL) revela o formulário.
 *
 * Claro/escuro usa o MESMO AcademyTemaToggle do resto do site/ERP — a
 * escolha é uma só em todo o domínio (data-tema no <html>). O painel de
 * marca à esquerda (ícones + cérebro + vitrine) fica sempre escuro nos dois
 * temas, de propósito — é vitrine de marca, não conteúdo de leitura, exatamente
 * como no modelo original.
 */

type Topico = { titulo: string; desc: string; icone: string };

const TOPICOS: Topico[] = [
  {
    titulo: "Inteligência artificial aplicada",
    desc: "Entenda onde a IA gera resultado real no seu negócio — e onde ela só gera custo.",
    icone: "M12 3a4 4 0 0 0-4 4 3 3 0 0 0-1 5.8V17a3 3 0 0 0 5 2.2A3 3 0 0 0 17 17v-4.2A3 3 0 0 0 16 7a4 4 0 0 0-4-4Z",
  },
  {
    titulo: "Agentes de atendimento 24h",
    desc: "Monte um agente que responde, qualifica e agenda sem você estar online.",
    icone: "M8 4h8v4H8zM6 8h12v8H6zM9 20h6M10 12h.01M14 12h.01",
  },
  {
    titulo: "Automação de processos",
    desc: "Elimine as tarefas repetitivas que consomem suas horas mais caras.",
    icone: "M4 7h6l2 3 2-3h6M4 7v10h16V7M9 17v3M15 17v3",
  },
  {
    titulo: "Dados que orientam decisão",
    desc: "Transforme números soltos em leitura clara do que fazer a seguir.",
    icone: "M4 20V10M9 20V4M14 20v-8M19 20V7",
  },
  {
    titulo: "Engenharia de prompt",
    desc: "Instruções precisas para respostas consistentes, todas as vezes.",
    icone: "M6 5h12M6 5l3 7-3 7h12l-3-7 3-7",
  },
  {
    titulo: "Integrações e no-code",
    desc: "Conecte suas ferramentas e faça a informação circular sozinha.",
    icone: "M9 8H6a3 3 0 0 0 0 6h3M15 16h3a3 3 0 0 0 0-6h-3M9 12h6",
  },
  {
    titulo: "Segurança digital e LGPD",
    desc: "Proteja dados de clientes e opere em conformidade sem burocracia.",
    icone: "M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6l7-3ZM9 12l2 2 4-4",
  },
  {
    titulo: "Infraestrutura e nuvem",
    desc: "Escolha o que sustenta seu sistema sem pagar pelo que não usa.",
    icone: "M4 15a4 4 0 0 1 3-6 5 5 0 0 1 9.5 1A3.5 3.5 0 0 1 19 16H7a3 3 0 0 1-3-1ZM12 12v8M9 17l3 3 3-3",
  },
  {
    titulo: "Produtividade com IA",
    desc: "Rotinas assistidas por IA para entregar mais com a mesma equipe.",
    icone: "M12 4v3M12 17v3M4 12h3M17 12h3M6.5 6.5l2 2M15.5 15.5l2 2M17.5 6.5l-2 2M8.5 15.5l-2 2M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z",
  },
  {
    titulo: "Liderança digital",
    desc: "Conduza a adoção de tecnologia com o time junto, não contra.",
    icone: "M12 4l3 3-3 3-3-3 3-3ZM5 20a7 7 0 0 1 14 0M9 13l3-2 3 2",
  },
];

const DURACAO_MS = 4000;

function reduzMovimento(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function AcademyLoginScreen({ erroOAuth }: { erroOAuth: string | null }) {
  const [aberto, setAberto] = useState(() => Boolean(erroOAuth));
  const [indice, setIndice] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (reduzMovimento()) return;
    timerRef.current = setInterval(() => {
      setIndice((v) => (v + 1) % TOPICOS.length);
    }, DURACAO_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function irPara(n: number) {
    setIndice(n);
    if (timerRef.current) clearInterval(timerRef.current);
    if (!reduzMovimento()) {
      timerRef.current = setInterval(() => setIndice((v) => (v + 1) % TOPICOS.length), DURACAO_MS);
    }
  }

  const ativo = TOPICOS[indice];

  return (
    <main className="academy-login" data-open={aberto}>
      <section className="academy-login-brand">
        <header className="academy-login-header">
          <img src="/marca/kyron-simbolo.png" alt="Kyron" />
          <div className="academy-login-wordmark">KYRON</div>
          <div className="academy-login-divider" />
          <div className="academy-login-wordmark accent">ACADEMY</div>
        </header>

        <div className="academy-login-theme-gate">
          <AcademyTemaToggle />
        </div>

        <div className="academy-login-topics">
          <div className="academy-login-topics-list" role="tablist" aria-label="O que você vai dominar">
            {TOPICOS.map((t, n) => (
              <button
                key={t.titulo}
                type="button"
                role="tab"
                aria-selected={n === indice}
                className="academy-login-topic"
                data-active={n === indice}
                onClick={() => irPara(n)}
              >
                <span className="academy-login-topic-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d={t.icone} />
                  </svg>
                </span>
                <span className="academy-login-topic-label">
                  <span>{t.titulo}</span>
                </span>
              </button>
            ))}
          </div>

          <div className="academy-login-orb">
            <div className="academy-login-orb-plate" aria-hidden="true" />
            <div className="academy-login-orb-glow" aria-hidden="true" />
            <img className="academy-login-orb-img" src="/academy/login-cerebro.png" alt="" />
          </div>
        </div>

        <div className="academy-login-copy">
          <p className="academy-login-topics-eyebrow">O QUE VOCÊ VAI DOMINAR</p>
          <div key={indice} className="academy-login-copy-fade">
            <h2>{ativo.titulo}</h2>
            <p>{ativo.desc}</p>
          </div>
        </div>
      </section>

      <button
        type="button"
        className="academy-login-gate"
        onClick={() => setAberto(true)}
        aria-hidden={aberto}
        tabIndex={aberto ? -1 : 0}
      >
        <ArrowRight size={17} />
        <span>ENTRAR</span>
      </button>

      <section className="academy-login-panel">
        <button
          type="button"
          className="academy-login-close"
          onClick={() => setAberto(false)}
          title="Fechar"
          aria-hidden={!aberto}
          tabIndex={aberto ? 0 : -1}
        >
          <X size={16} />
          <span>FECHAR</span>
        </button>

        <div className="academy-login-card">
          <div className="academy-login-panel-head">
            <Link href="/" className="academy-login-back"><ArrowLeft size={17} /> Voltar ao site</Link>
            <AcademyTemaToggle />
          </div>
          <AcademyAuth erroOAuth={erroOAuth} />
        </div>
      </section>
    </main>
  );
}
