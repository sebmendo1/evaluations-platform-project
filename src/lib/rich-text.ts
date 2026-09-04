export type ToneName = "keep" | "discard" | "hold" | "none";

/** A run of inline text, optionally in the mono face or a verdict colour. */
export type RichSpan =
  | string
  | { mono: string }
  | { accent: string }
  | { strong: string }
  | { tone: ToneName; text: string };

export type RichText = RichSpan[];

export const toneClass: Record<ToneName, string> = {
  keep: "v-keep",
  discard: "v-dis",
  hold: "v-hold",
  none: "v-none",
};
