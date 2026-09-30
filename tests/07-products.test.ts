import { describe, expect, it } from "vitest";

import {
  isReturnPath,
  productForPath,
  products,
} from "@/lib/product";

describe("07 §Two products · the URL owns the product", () => {
  it("treats /experiments and /attempts as Experiments", () => {
    expect(productForPath("/experiments")).toBe("experiments");
    expect(productForPath("/experiments/new")).toBe("experiments");
    expect(productForPath("/attempts")).toBe("experiments");
    expect(productForPath("/attempts/add-title-review")).toBe("experiments");
  });

  it("treats everything else as Evaluations", () => {
    expect(productForPath("/")).toBe("evaluations");
    expect(productForPath("/governance")).toBe("evaluations");
    expect(productForPath("/ask")).toBe("evaluations");
    expect(productForPath("/reports")).toBe("evaluations");
  });

  it("names exactly two products", () => {
    expect(products.map((product) => product.label)).toEqual([
      "Evaluations",
      "Experiments",
    ]);
  });

  it("rejects a return path that belongs to the other product", () => {
    expect(isReturnPath("/experiments", "evaluations")).toBe(false);
    expect(isReturnPath("/governance", "experiments")).toBe(false);
    expect(isReturnPath("/governance", "evaluations")).toBe(true);
    expect(isReturnPath("/attempts/add-title-review", "experiments")).toBe(true);
    expect(isReturnPath("https://evil.example/", "evaluations")).toBe(false);
    expect(isReturnPath("//evil.example", "evaluations")).toBe(false);
  });
});
