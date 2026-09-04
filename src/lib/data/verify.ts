export type VerifyField = {
  name: string;
  value: string;
  source: string;
  status: "ok" | "flag";
};

export const verifyFields: VerifyField[] = [
  { name: "Borrower name", value: "Nakamura, K.", source: "application pg 1", status: "ok" },
  { name: "Occupancy", value: "Primary residence", source: "application pg 1", status: "ok" },
  { name: "Credit score", value: "748", source: "credit report pg 1", status: "ok" },
  { name: "Housing history", value: "Owned, 6 yr", source: "credit report pg 2", status: "ok" },
  { name: "Wage income", value: "$9,240 / mo", source: "paystub pg 1–2", status: "ok" },
  { name: "Self-employment", value: "None", source: "tax return pg 1", status: "ok" },
  { name: "Rental income", value: "$1,100 / mo", source: "Schedule E pg 3", status: "ok" },
  { name: "InvestmentAccounts", value: "$41,300", source: "statement pg 2", status: "flag" },
  { name: "Total obligations", value: "$2,840 / mo", source: "credit report pg 3", status: "ok" },
  { name: "Qualifying payment", value: "$1,206.44", source: "computed", status: "ok" },
  { name: "DebtToIncomeRatio", value: "38.9%", source: "computed", status: "ok" },
  { name: "Property value", value: "$612,000", source: "appraisal pg 1", status: "ok" },
  { name: "Flood zone", value: "Zone X", source: "determination pg 1", status: "ok" },
  { name: "Outcome", value: "Approve, $95,000", source: "step 8", status: "ok" },
];

export const reviewSubject = "HL-40012";

export const recentReviews = [
  {
    id: "HL-40119",
    detail: "14 fields · 0 corrections",
    result: "agreed",
    tone: "keep" as const,
    by: "s.mendo · 12:18",
  },
  {
    id: "HL-40086",
    detail: "14 fields · 1 correction",
    result: "InvestmentAccounts",
    tone: "discard" as const,
    by: "j.park · 12:09",
  },
  {
    id: "HL-40044",
    detail: "14 fields · 0 corrections",
    result: "agreed",
    tone: "keep" as const,
    by: "j.park · 11:52",
  },
  {
    id: "HL-39988",
    detail: "awaiting review",
    result: "open",
    tone: "hold" as const,
    by: "drawn 11:31",
  },
];

export const verifyStats = {
  sampledAccuracy: "95.1%",
  sampledDetail: "69 of 70 fields agreed",
  openReviews: "2",
  openDetail: "drawn 11:31 and 11:40",
};
