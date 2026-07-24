"use client";

import { useCallback, useRef, useState } from "react";

import type { ChatMessage, ChatStreamEvent } from "./types";

const GREETING: ChatMessage = {
  id: "greeting",
  role: "assistant",
  content:
    "Olá! Sou o assistente da Kyron. Posso ajudar com Apple novos e seminovos, casa inteligente, áudio e nossos serviços de instalação. O que você procura hoje?",
};

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leadRegistrado, setLeadRegistrado] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const appendToLast = useCallback((text: string) => {
    setMessages((prev) => {
      const next = [...prev];
      const last = next[next.length - 1];
      if (last?.role === "assistant") {
        next[next.length - 1] = { ...last, content: last.content + text };
      }
      return next;
    });
  }, []);

  const send = useCallback(
    async (input: string) => {
      const text = input.trim();
      if (!text || isStreaming) return;

      setError(null);

      const userMessage: ChatMessage = { id: newId(), role: "user", content: text };
      const placeholder: ChatMessage = { id: newId(), role: "assistant", content: "" };

      // A saudação é local; não faz parte do histórico enviado ao modelo.
      const history = [...messages, userMessage]
        .filter((m) => m.id !== "greeting")
        .map(({ role, content }) => ({ role, content }));

      setMessages((prev) => [...prev, userMessage, placeholder]);
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            messages: history,
            pagina: window.location.pathname,
          }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          const payload = await response.json().catch(() => null);
          throw new Error(
            payload?.error ?? "Não consegui responder agora. Tente novamente.",
          );
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const frames = buffer.split("\n\n");
          buffer = frames.pop() ?? "";

          for (const frame of frames) {
            const line = frame.trim();
            if (!line.startsWith("data:")) continue;

            let event: ChatStreamEvent;
            try {
              event = JSON.parse(line.slice(5).trim());
            } catch {
              continue;
            }

            if (event.type === "delta") appendToLast(event.text);
            else if (event.type === "tool") setLeadRegistrado(true);
            else if (event.type === "error") setError(event.message);
          }
        }
      } catch (caught) {
        if ((caught as Error)?.name === "AbortError") return;
        setError(
          caught instanceof Error
            ? caught.message
            : "Não consegui responder agora. Tente novamente.",
        );
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
        // Remove a bolha vazia quando a resposta falhou antes do primeiro token.
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && last.content === "") {
            return prev.slice(0, -1);
          }
          return prev;
        });
      }
    },
    [appendToLast, isStreaming, messages],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { messages, isStreaming, error, leadRegistrado, send, stop };
}
