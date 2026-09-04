import { AskChat } from "@/components/ask/chat";

export const metadata = {
  title: "Ask Astro",
};

/**
 * 07 §Conversation is not a destination — Ask is "a standalone thread bound to
 * nothing". It owns its own composer, so the shell's scoped one steps aside here
 * rather than putting two inputs on the same screen.
 */
export default async function AskPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const seed = typeof q === "string" ? q.trim() : "";

  return <AskChat seed={seed} />;
}
