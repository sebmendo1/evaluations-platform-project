/**
 * INV-1 · Every recorded field resolves to a source.
 *
 * A field is either extracted (document + page) or computed (named formula +
 * input field ids) or stated (a named human, at a time, via a resolution). No
 * fourth shape exists, and the union must stay closed: a field whose provenance
 * cannot be constructed is a defect, not a low-confidence value.
 *
 * Spec: 02 · Field, 00 · INV-1
 */

export type Extracted = {
  kind: "extracted";
  document: string;
  page: number;
  extractor: "document-reader";
};

export type Computed = {
  kind: "computed";
  formula: string;
  inputs: string[];
};

export type Stated = {
  kind: "stated";
  by: string;
  at: string;
  resolution: string;
};

export type Provenance = Extracted | Computed | Stated;

export function extracted(document: string, page: number): Extracted {
  if (!document.trim()) {
    throw new Error("INV-1: extracted provenance requires a document");
  }
  if (!Number.isInteger(page) || page < 1) {
    throw new Error("INV-1: extracted provenance requires a page number");
  }
  return { kind: "extracted", document, page, extractor: "document-reader" };
}

export function computed(formula: string, inputs: string[]): Computed {
  if (!formula.trim()) {
    throw new Error("INV-1: computed provenance requires a named formula");
  }
  if (inputs.length === 0) {
    throw new Error("INV-1: computed provenance requires its input field ids");
  }
  return { kind: "computed", formula, inputs };
}

export function stated(by: string, at: string, resolution: string): Stated {
  if (!by.trim()) {
    throw new Error("INV-1: stated provenance requires a named person");
  }
  if (!resolution.trim()) {
    throw new Error("INV-1: stated provenance requires the resolution it came from");
  }
  return { kind: "stated", by, at, resolution };
}

/** How a citation reads in the UI. Computed fields cite their formula, which is
 *  the stated exception behind the citation-coverage figure in 05 §3. */
export function citation(provenance: Provenance): string {
  switch (provenance.kind) {
    case "extracted":
      return `${provenance.document} pg ${provenance.page}`;
    case "computed":
      return `computed · ${provenance.formula}`;
    case "stated":
      return `stated by ${provenance.by}`;
  }
}

/** 05 §3 · citation_coverage. Computed fields resolve to inputs and a formula
 *  rather than a page, and are the stated exception rather than a miss. */
export function hasPageCitation(provenance: Provenance): boolean {
  return provenance.kind === "extracted";
}
