import Link from "next/link";

export const metadata = {
  title: "Not found",
};

export default function NotFound() {
  return (
    <>
      <h1>Nothing at this address</h1>
      <p className="lede">
        The run, batch, or bundle you asked for isn’t in this workspace. It may belong to
        another environment, or it was never written to the ledger.
      </p>
      <div className="actions">
        <Link className="btn pri" href="/">
          Back to overview
        </Link>
        <Link className="btn" href="/batches/batch-0903-am">
          Open the running batch
        </Link>
      </div>
    </>
  );
}
