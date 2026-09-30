import Link from "next/link";

import { FieldReview } from "@/components/verify/field-review";
import { Metric } from "@/components/metric";
import { recentReviews, reviewSubject, verifyFields, verifyStats } from "@/lib/data/verify";
import { toneClass } from "@/lib/rich-text";

export const metadata = {
  title: "Blind review",
};

export default function VerifyPage() {
  return (
    <>
      <div className="crumb">
        <Link href="/">Overview</Link> › blind review
      </div>
      <h1>Verify data</h1>
      <p className="lede">
        Five of 93 clean files drawn at random. The reviewer isn’t told which files are
        sampled, so this catches the failure the queue never shows you — a file the run got
        wrong confidently.
      </p>

      <div className="strip2" style={{ maxWidth: "520px" }}>
        <Metric
          id="sampled_accuracy"
          context="production"
          size="small"
          value={verifyStats.sampledAccuracy}
          n="70 fields"
          detail={verifyStats.sampledDetail}
        />
        <div className="small warn">
          <div className="lab">Open reviews</div>
          <div className="val mono">{verifyStats.openReviews}</div>
          <div className="sub">{verifyStats.openDetail}</div>
        </div>
      </div>

      {/* 06 · sampled_accuracy where n is small states the limitation on the page,
          not in a footnote. 04 §4 is explicit that a figure quoted upstairs and
          qualified later costs more credibility than a caveat costs attention. */}
      <p className="takeaway" style={{ borderLeftColor: "var(--p-hold)" }}>
        What this doesn’t tell you: 95.1% is 69 of 70 fields across five files. It can
        catch a systematic error and it cannot carry a confidence interval. At the current
        draw rate it takes about three weeks to reach a number worth quoting outside this
        page — until then read it as a direction, not a measurement.
      </p>

      <div className="sec">
        <FieldReview fields={verifyFields} subject={reviewSubject} />
      </div>

      <div className="sec">
        <div className="sechead">
          <h3>Recent reviews</h3>
        </div>
        <div className="wrap">
          <table className="tbl">
            <caption className="sr-only">Recently completed blind reviews</caption>
            <tbody>
              {recentReviews.map((review) => (
                <tr key={review.id}>
                  <td className="m">{review.id}</td>
                  <td>{review.detail}</td>
                  <td className={toneClass[review.tone]}>{review.result}</td>
                  <td>{review.by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
