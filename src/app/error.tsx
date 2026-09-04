"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <h1>This view failed to render</h1>
      <p className="lede">
        Nothing was written to the ledger. Retry, and if it keeps happening the run snapshot
        behind this page is unavailable.
      </p>
      <div className="actions">
        <button className="btn pri" type="button" onClick={reset}>
          Try again
        </button>
      </div>
    </>
  );
}
