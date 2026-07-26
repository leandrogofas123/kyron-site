"use client";

import { type ReactNode, useEffect, useId, useRef, useState } from "react";

import { useChat } from "./useChat";
import { registrarEvento } from "@/components/site/Analytics";
import { linkWhatsApp } from "@/lib/kyron/site";

export function ChatWidget() {
  // Abre já aberto: o assistente é o principal canal de atendimento do site.
  const [open, setOpen] = useState(true);
  const [draft, setDraft] = useState("");
  // O banner de cookies ocupa a base da tela e cobriria o launcher no celular.
  const [cookiesAbertos, setCookiesAbertos] = useState(false);
  const { messages, isStreaming, error, leadRegistrado, send, stop } = useChat();

  const whatsUrl = linkWhatsApp(
    "Olá! Vim pelo site da Kyron e gostaria de falar com um especialista.",
  );

  const panelId = useId();
  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  // Esc fecha o painel e devolve o foco ao botão de origem.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        launcherRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages]);

  // Lead capturado pelo agente durante a conversa — a conversão que importa.
  useEffect(() => {
    if (leadRegistrado) registrarEvento("chat_lead");
  }, [leadRegistrado]);

  useEffect(() => {
    const aoMudar = (e: Event) =>
      setCookiesAbertos((e as CustomEvent<boolean>).detail === true);
    window.addEventListener("kyron:painel-cookies", aoMudar);
    return () => window.removeEventListener("kyron:painel-cookies", aoMudar);
  }, []);

  function submit() {
    const text = draft;
    setDraft("");
    void send(text);
  }

  // Compacto por padrão (só cabeçalho + campo). Cresce quando a conversa começa
  // — ou quando há erro/lead a mostrar.
  const expandido =
    messages.length > 1 || isStreaming || Boolean(error) || leadRegistrado;

  // Enquanto o banner de cookies estiver na tela, o assistente sai de cena.
  if (cookiesAbertos && !open) return null;

  return (
    <>
      {!open && (
        <button
          ref={launcherRef}
          type="button"
          onClick={() => {
            registrarEvento("chat_open");
            setOpen(true);
          }}
          aria-expanded={false}
          aria-controls={panelId}
          aria-label="Abrir assistente da Kyron"
          /* Canto DIREITO — o WhatsApp fica no esquerdo. Tamanho fluido, nunca < 48px. */
          className="kyron-chat-launcher fixed bottom-[clamp(1rem,3vw,1.5rem)] right-[clamp(1rem,3vw,1.5rem)] z-50 flex h-[clamp(3rem,7vw,3.5rem)] w-[clamp(3rem,7vw,3.5rem)] items-center justify-center rounded-full border border-[var(--kyron-hairline-strong)] bg-kyron-graphite text-kyron-white shadow-[0_8px_28px_rgba(0,0,0,0.5)] transition-all duration-300 ease-in-out hover:-translate-y-0.5"
        >
          <IconChat />
        </button>
      )}

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Assistente da Kyron"
          /* Canto DIREITO. Compacto (altura automática) até a conversa começar;
             aí cresce até a altura máxima. dvh (não vh) para não brigar com a
             barra do navegador móvel, que aparece e some ao rolar. */
          className={`fixed bottom-[clamp(1rem,3vw,1.5rem)] right-[clamp(1rem,3vw,1.5rem)] z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-black shadow-[0_24px_64px_rgba(0,0,0,0.6)] ${
            expandido ? "h-[min(34rem,calc(100dvh-4rem))]" : ""
          }`}
        >
          <header className="flex items-center justify-between gap-4 border-b border-[var(--kyron-hairline)] bg-kyron-graphite px-fluid-md py-fluid-sm">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-kyron-blue"
                aria-hidden="true"
              />
              <p className="kyron-display text-fluid-xs tracking-[0.14em] text-kyron-white">
                KYRON BOT
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                launcherRef.current?.focus();
              }}
              aria-label="Minimizar assistente"
              className="flex h-8 w-8 items-center justify-center rounded-kyron-sm text-kyron-silver transition-colors duration-300 hover:text-kyron-white"
            >
              <IconMinimize />
            </button>
          </header>

          {expandido && (
          <div
            ref={logRef}
            className="kyron-scroll flex-1 space-y-4 overflow-y-auto px-fluid-md py-fluid-md"
            role="log"
            aria-live="polite"
            aria-atomic="false"
          >
            {messages.map((message) =>
              message.role === "user" ? (
                <p
                  key={message.id}
                  className="ml-auto max-w-[85%] rounded-kyron-sm bg-kyron-surface px-3.5 py-2.5 text-fluid-sm text-kyron-white"
                >
                  {message.content}
                </p>
              ) : (
                <p
                  key={message.id}
                  className="max-w-[92%] whitespace-pre-wrap text-fluid-sm leading-relaxed text-kyron-silver"
                >
                  {renderConteudo(message.content)}
                </p>
              ),
            )}

            {isStreaming && messages[messages.length - 1]?.content === "" && (
              <TypingDots />
            )}

            {leadRegistrado && (
              <p className="rounded-kyron-sm border-l-2 border-kyron-blue bg-kyron-graphite px-3.5 py-2.5 text-fluid-xs text-kyron-silver">
                Contato registrado. Um especialista responde em até 1 dia útil.
              </p>
            )}

            {error && (
              <div className="rounded-kyron-sm border border-[var(--kyron-hairline-strong)] px-3.5 py-2.5 text-fluid-xs text-kyron-silver">
                <p>{error}</p>
                {whatsUrl && (
                  <a
                    href={whatsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-block text-kyron-blue underline underline-offset-2"
                  >
                    Falar no WhatsApp
                  </a>
                )}
              </div>
            )}
          </div>
          )}

          <form
            className="border-t border-[var(--kyron-hairline)] px-fluid-sm py-fluid-xs"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <div className="flex items-end gap-2">
              <label htmlFor={`${panelId}-input`} className="sr-only">
                Escreva sua mensagem
              </label>
              <textarea
                id={`${panelId}-input`}
                ref={inputRef}
                rows={1}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    submit();
                  }
                }}
                placeholder="Escreva sua mensagem"
                className="kyron-scroll max-h-28 min-h-[44px] flex-1 resize-none rounded-kyron-sm border border-[var(--kyron-hairline)] bg-kyron-graphite px-3 py-2.5 text-fluid-sm text-kyron-white placeholder:text-kyron-silver/45 focus:border-[var(--kyron-blue-line)] focus:outline-none"
              />

              {isStreaming ? (
                <button
                  type="button"
                  onClick={stop}
                  className="kyron-label h-11 shrink-0 rounded-kyron-sm border border-[var(--kyron-hairline-strong)] px-3 text-fluid-2xs text-kyron-silver"
                >
                  Parar
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!draft.trim()}
                  aria-label="Enviar mensagem"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-kyron-sm bg-kyron-blue text-kyron-white transition-opacity duration-300 ease-in-out disabled:opacity-35"
                >
                  <IconSend />
                </button>
              )}
            </div>

            {expandido && (
              <p className="mt-2 text-fluid-2xs leading-snug text-kyron-silver/50">
                Assistente automatizado. Não informe senhas, dados bancários ou documentos.
              </p>
            )}
          </form>
        </div>
      )}
    </>
  );
}

/**
 * Renderiza o texto do assistente transformando links markdown [texto](url) em
 * botões clicáveis dentro da conversa. Links internos abrem na mesma aba;
 * externos, em nova. Durante o streaming, um link ainda incompleto aparece como
 * texto até fechar — e então vira botão.
 */
function renderConteudo(texto: string): ReactNode[] {
  const re = /\[([^\]]+)\]\((\/[^\s)]+|https?:\/\/[^\s)]+)\)/g;
  const nos: ReactNode[] = [];
  let ultimo = 0;
  let chave = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(texto)) !== null) {
    if (m.index > ultimo) nos.push(...comNegrito(texto.slice(ultimo, m.index), `t${chave}`));
    const [, rotulo, url] = m;
    const externo = url.startsWith("http");
    nos.push(
      <a
        key={`lk-${chave++}`}
        href={url}
        {...(externo
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        className="my-1 inline-flex items-center gap-1.5 rounded-kyron-sm bg-kyron-blue px-3.5 py-2 text-fluid-xs font-medium text-white no-underline transition-all duration-300 hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(30,107,255,0.3)]"
      >
        {rotulo}
        <span aria-hidden="true">→</span>
      </a>,
    );
    ultimo = m.index + m[0].length;
  }
  if (ultimo < texto.length) nos.push(...comNegrito(texto.slice(ultimo), "fim"));
  return nos;
}

/** Converte **negrito** de um trecho de texto em <strong>. */
function comNegrito(texto: string, prefixo: string): ReactNode[] {
  const re = /\*\*([^*]+)\*\*/g;
  const nos: ReactNode[] = [];
  let ultimo = 0;
  let chave = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(texto)) !== null) {
    if (m.index > ultimo) nos.push(texto.slice(ultimo, m.index));
    nos.push(
      <strong key={`${prefixo}-b${chave++}`} className="font-semibold text-kyron-white">
        {m[1]}
      </strong>,
    );
    ultimo = m.index + m[0].length;
  }
  if (ultimo < texto.length) nos.push(texto.slice(ultimo));
  return nos;
}

function TypingDots() {
  return (
    <p className="flex items-center gap-1.5" aria-label="Escrevendo">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="h-1.5 w-1.5 rounded-full bg-kyron-silver"
          style={{
            animation: "kyron-pulse 1.4s ease-in-out infinite",
            animationDelay: `${index * 0.18}s`,
          }}
        />
      ))}
    </p>
  );
}

function IconChat() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMinimize() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m6 10 6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSend() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 12h15M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
