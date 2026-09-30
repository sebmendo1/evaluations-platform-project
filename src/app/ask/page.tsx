import { AskChat } from "@/components/ask/chat";

export const metadata = {
  title: "Agent",
};

/**
 * 07 §Conversation — Agent (`/ask`) is a standalone thread bound to nothing.
 * It owns its own composer; Loan Originator is the hero brand signal.
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
