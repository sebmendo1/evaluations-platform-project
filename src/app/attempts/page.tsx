import Link from "next/link";

import { BoardView, ListView, TimelineView } from "@/components/attempts/views";
import { Crumbs } from "@/components/crumbs";
import { SectionTabs } from "@/components/section-tabs";
import { attempts, attemptVerdict } from "@/lib/data/attempts";
import { experimentCrumbs } from "@/lib/crumbs";

export const metadata = {
  title: "Attempts",
};

const VIEWS = ["board", "timeline", "list"] as const;

export default async function AttemptsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const initial = VIEWS.includes(view as (typeof VIEWS)[number]) ? view! : "board";

  const decided = attempts.filter((a) => attemptVerdict(a) !== "pending").length;
  const open = attempts.length - decided;

  return (
    <>
      <Crumbs segments={experimentCrumbs({ view: "board" })} />
      <h1>Attempts</h1>
      <p className="lede">
        Each one is a hypothesis about the eight-step review, the set it was tested
        against, and what it did to the queue. {decided} of {attempts.length} reached a
        verdict; {open} are still open.
      </p>

      {/* All three views render on the first request, so switching is instant. */}
      <SectionTabs
        label="Attempt views"
        param="view"
        initial={initial}
        tabs={[
          {
            key: "board",
            label: "Board",
            count: attempts.length,
            panel: <BoardView />,
            action: (
              <Link className="btn pri" href="/experiments/new">
                New experiment
              </Link>
            ),
          },
          {
            key: "timeline",
            label: "Timeline",
            count: attempts.length,
            panel: <TimelineView />,
          },
          {
            key: "list",
            label: "List",
            count: attempts.length,
            panel: <ListView />,
          },
        ]}
      />
    </>
  );
}
