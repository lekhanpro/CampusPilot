import { useState, useCallback } from "react";
import { sendChatMessageStream } from "../services/api";
import type { ChatMessage } from "../types";
import { capture } from "../lib/posthog";

let messageCounter = 0;

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const send = useCallback(async (query: string, documentIds?: string[]) => {
    if (!query.trim() || isLoading) return;
    const userMessage: ChatMessage = {
      id: `msg-${++messageCounter}`, role: "user", content: query, timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    try {
      const history = messages.slice(-6).map((m) => ({ role: m.role, content: m.content }));
      const assistantId = `msg-${++messageCounter}`;
      const assistantMessage: ChatMessage = {
        id: assistantId, role: "assistant", content: "", timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      await sendChatMessageStream(
        query,
        documentIds,
        history,
        (token) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + token } : m
            )
          );
        },
        ({ sources, model }) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, sources, model } : m
            )
          );
        }
      );
      capture("chat_completed", {
        document_ids: documentIds?.length || 0,
        tokens_received: 1,
      });
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `msg-${++messageCounter}`, role: "assistant",
        content: `Error: ${err.message}. Please try again.`, timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  const clearChat = useCallback(() => { setMessages([]); }, []);

  return { messages, isLoading, send, clearChat };
}
