/**
 * 08 §4a · marks a data surface. At 1440px and up the body widens to
 * --p-measure-wide when this is present; documents leave it out and keep 880.
 */
export function WideMeasure() {
  return <span className="measure-wide" hidden />;
}
