"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { StatusRow } from "@/components/blocks";
import { Rich } from "@/components/rich-text";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { respond, type AskAction, type AskMode } from "@/lib/ask/respond";
import type { RichText } from "@/lib/rich-text";

type Message =
  | { role: "you"; text: string }
  | { role: "astro"; paragraphs: RichText[]; action?: AskAction };

function SendIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 13V3.5" />
      <path d="M3.75 7.75 8 3.5l4.25 4.25" />
    </svg>
  );
}

/** Soft panel composer — placeholder above, circular send alone in the bar. */
function Composer({
  value,
  onChange,
  onSubmit,
  autoFocus,
  placeholder,
  inputRef,
}: {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  autoFocus?: boolean;
  placeholder: string;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  return (
    <form
      className="composer-card"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Textarea
        ref={inputRef}
        className="composer-input min-h-[88px] resize-none border-0 bg-transparent focus-visible:ring-0"
        rows={1}
        value={value}
        autoFocus={autoFocus}
        placeholder={placeholder}
        aria-label="Ask Agent"
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onSubmit();
          }
        }}
      />
      <div className="composer-bar">
        <Button
          className="composer-send"
          type="submit"
          size="icon-sm"
          disabled={!value.trim()}
          aria-label="Send"
        >
          <SendIcon />
        </Button>
      </div>
    </form>
  );
}

function ModeToggle({
  mode,
  onChange,
}: {
  mode: AskMode;
  onChange: (next: AskMode) => void;
}) {
  return (
    <div className="modetoggle" role="radiogroup" aria-label="What Astro should do">
      <button
        type="button"
        role="radio"
        aria-checked={mode === "answer"}
        className={mode === "answer" ? "modetoggle-item on" : "modetoggle-item"}
        onClick={() => onChange("answer")}
      >
        Answer
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={mode === "act"}
        className={mode === "act" ? "modetoggle-item on" : "modetoggle-item"}
        onClick={() => onChange("act")}
      >
        Act
      </button>
    </div>
  );
}

function ActionCard({ action }: { action: AskAction }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="actbox" style={{ marginTop: "16px" }}>
      <div className="t">{action.prompt}</div>
      <div className="chat-action-meta">
        <span>
          scope <span className="mono">{action.scope}</span>
        </span>
        <span>
          estimated <span className="mono">{action.cost}</span>
        </span>
      </div>
      <div className="r">
        <Link className="y" href={action.href}>
          {action.confirmLabel}
        </Link>
        <Button type="button" variant="ghost" size="sm" onClick={() => setDismissed(true)}>
          Not now
        </Button>
      </div>
    </div>
  );
}

export function AskChat({ seed }: { seed: string }) {
  const [mode, setMode] = useState<AskMode>("answer");
  const [messages, setMessages] = useState<Message[]>(() =>
    seed ? [{ role: "you", text: seed }, { role: "astro", ...respond(seed) }] : [],
  );
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const started = messages.length > 0;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "j") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function send(question: string) {
    const trimmed = question.trim();
    if (!trimmed) return;
    setValue("");
    setMessages((current) => [
      ...current,
      { role: "you", text: trimmed },
      { role: "astro", ...respond(trimmed, mode) },
    ]);
    requestAnimationFrame(() => {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    });
  }

  if (!started) {
    return (
      <div className="ask-hero">
        <div className="ask-hero-head">
          <span className="ask-hero-brand">
            <Image
              src="/brand/chase-octagon.png"
              alt=""
              width={20}
              height={20}
              priority
            />
            <span className="ask-hero-name brandtype">Loan Originator</span>
          </span>
          <ModeToggle mode={mode} onChange={setMode} />
        </div>

        <Composer
          value={value}
          onChange={setValue}
          onSubmit={() => send(value)}
          autoFocus
          placeholder="Ask about a held file, a bundle, or a number"
          inputRef={inputRef}
        />
      </div>
    );
  }

  return (
    <div className="chat-thread">
      <div className="chat-log">
        {messages.map((message, index) =>
          message.role === "you" ? (
            <div className="chat-turn chat-turn-you" key={index}>
              <div className="who">you</div>
              <div className="msg u">{message.text}</div>
            </div>
          ) : (
            <div className="chat-turn" key={index}>
              <div className="who">astro</div>
              {message.action ? (
                <StatusRow
                  items={[
                    { lab: "scope", val: message.action.scope },
                    { lab: "estimated", val: message.action.cost },
                    { lab: "mode", val: "act" },
                  ]}
                />
              ) : null}
              <div className="msg">
                {message.paragraphs.map((para, paraIndex) => (
                  <p key={paraIndex}>
                    <Rich parts={para} />
                  </p>
                ))}
              </div>
              {message.action ? <ActionCard action={message.action} /> : null}
            </div>
          ),
        )}
        <div ref={endRef} />
      </div>

      <div className="chat-dock">
        <div className="chat-dock-head">
          <ModeToggle mode={mode} onChange={setMode} />
        </div>
        <Composer
          value={value}
          onChange={setValue}
          onSubmit={() => send(value)}
          placeholder="Ask a follow-up"
          inputRef={inputRef}
        />
      </div>
    </div>
  );
}
