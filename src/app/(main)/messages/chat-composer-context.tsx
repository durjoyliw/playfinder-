"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";

interface ChatComposerContextValue {
  fillInput: (text: string) => void;
  scrollToBottom: () => void;
  registerFillInput: (fn: (text: string) => void) => void;
  registerScrollToBottom: (fn: () => void) => void;
}

const ChatComposerContext = createContext<ChatComposerContextValue | null>(
  null,
);

export function ChatComposerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const fillRef = useRef<(text: string) => void>(() => {});
  const scrollRef = useRef<() => void>(() => {});

  const registerFillInput = useCallback((fn: (text: string) => void) => {
    fillRef.current = fn;
  }, []);

  const registerScrollToBottom = useCallback((fn: () => void) => {
    scrollRef.current = fn;
  }, []);

  const fillInput = useCallback((text: string) => {
    fillRef.current(text);
  }, []);

  const scrollToBottom = useCallback(() => {
    scrollRef.current();
  }, []);

  const value = useMemo(
    () => ({
      fillInput,
      scrollToBottom,
      registerFillInput,
      registerScrollToBottom,
    }),
    [fillInput, scrollToBottom, registerFillInput, registerScrollToBottom],
  );

  return (
    <ChatComposerContext.Provider value={value}>
      {children}
    </ChatComposerContext.Provider>
  );
}

export function useChatComposer() {
  const ctx = useContext(ChatComposerContext);
  if (!ctx) {
    throw new Error("useChatComposer must be used within ChatComposerProvider");
  }
  return ctx;
}
