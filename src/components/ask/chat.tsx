"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { Rich } from "@/components/rich-text";
import { StatusRow } from "@/components/blocks";
import { askSuggestions, respond, type AskAction, type AskMode } from "@/lib/ask/respond";
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

/** The composer: placeholder above, a toolbar inside the same card below it. */
function Composer({
  value,
  onChange,
  onSubmit,
  autoFocus,
  placeholder,
  inputRef,
  scope,
}: {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  autoFocus?: boolean;
  placeholder: string;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  scope: string;
}) {
  return (
    <form
      className="composer-card"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <textarea
        ref={inputRef}
        className="composer-input"
        rows={1}
        value={value}
        autoFocus={autoFocus}
        placeholder={placeholder}
        aria-label="Ask Astro"
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onSubmit();
          }
        }}
      />
      <div className="composer-bar">
        <span className="composer-scope">{scope}</span>
        <span className="kbd composer-hint">⌘J</span>
        <button
          className="composer-send"
          type="submit"
          disabled={!value.trim()}
          aria-label="Send"
        >
          <SendIcon />
        </button>
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
      {/* 07 · never executed from inferred intent, so scope and cost are stated
          before the confirmation is offered. */}
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
        <button type="button" onClick={() => setDismissed(true)}>
          Not now
        </button>
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
              width={24}
              height={24}
              priority
            />
            <span className="ask-hero-name brandtype">Astro</span>
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
          scope="ask · everything"
        />

        {/* Attached below the card, the way the reference carries its hint — except
            this is a disclosure rather than a promotion, so it does not dismiss. */}
        <div className="ask-note">
          <span className="ask-note-mark mono">i</span>
          <span>
            No model sits behind this. It reads the workspace and answers from what the
            platform already holds.
          </span>
          <span className="ask-note-mode">
            {mode === "answer"
              ? "Answer explains and stops."
              : "Act proposes an operation with its scope and cost."}
          </span>
        </div>

        <div className="ask-suggestions">
          {askSuggestions.map((suggestion) => (
            <button key={suggestion} type="button" onClick={() => send(suggestion)}>
              {suggestion}
            </button>
          ))}
        </div>
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
          scope="ask · everything"
        />
      </div>
    </div>
  );
}
