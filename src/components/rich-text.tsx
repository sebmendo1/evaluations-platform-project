import { Fragment } from "react";

import { toneClass, type RichText } from "@/lib/rich-text";

export function Rich({ parts }: { parts: RichText }) {
  return (
    <>
      {parts.map((span, index) => {
        if (typeof span === "string") {
          return <Fragment key={index}>{span}</Fragment>;
        }
        if ("mono" in span) {
          return (
            <span className="mono" key={index}>
              {span.mono}
            </span>
          );
        }
        if ("accent" in span) {
          return (
            <span className="mono" style={{ color: "var(--p-accent)" }} key={index}>
              {span.accent}
            </span>
          );
        }
        if ("strong" in span) {
          return <b key={index}>{span.strong}</b>;
        }
        return (
          <span className={toneClass[span.tone]} key={index}>
            {span.text}
          </span>
        );
      })}
    </>
  );
}
