/**
 * 07 §Two products · Evaluations is the underwriting ledger; Experiments is the
 * eval loop. The URL owns which product is current. The rail brand row switches
 * via dropdown; last-place memory lives in the cookies below.
 */

export const PRODUCT_IDS = ["evaluations", "experiments"] as const;
export type ProductId = (typeof PRODUCT_IDS)[number];

export type Product = {
  id: ProductId;
  label: string;
  home: string;
};

export const products: readonly Product[] = [
  { id: "evaluations", label: "Evaluations", home: "/" },
  { id: "experiments", label: "Experiments", home: "/experiments" },
];

export const EVAL_AT_COOKIE = "astro-eval-at";
export const EXP_AT_COOKIE = "astro-exp-at";

export function productById(id: ProductId): Product {
  return products.find((product) => product.id === id) ?? products[0];
}

export function productForPath(pathname: string): ProductId {
  if (
    pathname === "/experiments" ||
    pathname.startsWith("/experiments/") ||
    pathname === "/attempts" ||
    pathname.startsWith("/attempts/")
  ) {
    return "experiments";
  }
  return "evaluations";
}

export function returnCookie(product: ProductId): string {
  return product === "evaluations" ? EVAL_AT_COOKIE : EXP_AT_COOKIE;
}

/** A path we may send the reviewer back to. No protocol, no host. */
export function isReturnPath(value: string | undefined, product: ProductId): value is string {
  if (!value) return false;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("://")) {
    return false;
  }
  return productForPath(value) === product;
}
