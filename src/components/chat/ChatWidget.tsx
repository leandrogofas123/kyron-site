"use client";

import { useEffect, useId, useRef, useState } from "react";

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

  // Enquanto o banner de cookies estiver na tela, o assistente sai de cena.
  if (cookiesAbertos && !open) return null;

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        onClick={() => {
          if (!open) registrarEvento("chat_open");
          setOpen((v) => !v);
        }}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Fechar assistente da Kyron" : "Abrir assistente da Kyron"}
        /* Canto ESQUERDO — o WhatsApp fica no direito. Tamanho fluido, nunca < 48px. */
        className="kyron-chat-launcher fixed bottom-[clamp(1rem,3vw,1.5rem)] left-[clamp(1rem,3vw,1.5rem)] z-50 flex h-[clamp(3rem,7vw,3.5rem)] w-[clamp(3rem,7vw,3.5rem)] items-center justify-center rounded-full border border-[var(--kyron-hairline-strong)] bg-kyron-graphite text-kyron-white shadow-[0_8px_28px_rgba(0,0,0,0.5)] transition-all duration-300 ease-in-out hover:-translate-y-0.5"
      >
        {open ? <IconClose /> : <IconChat />}
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Assistente da Kyron"
          /* Em telas pequenas ocupa quase tudo; em telas grandes vira um painel
             lateral. dvh (não vh) para não brigar com a barra do navegador
             móvel, que aparece e some ao rolar. */
          className="fixed bottom-[clamp(5rem,13vw,5.75rem)] left-[clamp(1rem,3vw,1.5rem)] z-50 flex h-[min(34rem,calc(100dvh-8rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-kyron-md border border-[var(--kyron-hairline)] bg-kyron-black shadow-[0_24px_64px_rgba(0,0,0,0.6)]"
        >
          <header className="flex items-start justify-between gap-4 border-b border-[var(--kyron-hairline)] bg-kyron-graphite px-fluid-md py-fluid-sm">
            <div>
              <p className="kyron-display text-fluid-xs text-kyron-white">Kyron</p>
              <p className="mt-0.5 text-fluid-2xs text-kyron-silver/70">
                Assistente · responde com base no que a Kyron faz
              </p>
            </div>
            <span
              className="mt-1 h-2 w-2 shrink-0 rounded-full bg-kyron-blue"
              aria-hidden="true"
            />
          </header>

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
                  {message.content}
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

            <p className="mt-2 text-fluid-2xs leading-snug text-kyron-silver/50">
              Assistente automatizado. Não informe senhas, dados bancários ou documentos.
            </p>
          </form>
        </div>
      )}
    </>
  );
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

function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m6 6 12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
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
