import type { UserRole } from "./types";

function normalizeRole(role: string): UserRole {
  const normalized = role?.toLowerCase().replace(/[\s-]+/g, "_");
  if (normalized === "data_analyst" || normalized === "analytics_engineer" || normalized === "learner") {
    return normalized as UserRole;
  }
  return "data_analyst";
}

export function getRecommendedCaseForRole(role: UserRole | string): string {
  const mapping: Record<UserRole, string> = {
    learner: "case-marketing-roi",
    data_analyst: "case-retail-sales",
    analytics_engineer: "case-churn-retention",
  };
  const key = normalizeRole(role);
  return mapping[key] || "case-retail-sales";
}

export function getCaseRankForRole(caseId: string, role: UserRole | string): number {
  const rankings: Record<UserRole, string[]> = {
    learner: ["case-marketing-roi", "case-retail-sales", "case-churn-retention"],
    data_analyst: ["case-retail-sales", "case-marketing-roi", "case-churn-retention"],
    analytics_engineer: ["case-churn-retention", "case-retail-sales", "case-marketing-roi"],
  };
  const key = normalizeRole(role);
  const list = rankings[key] || rankings.data_analyst;
  const rank = list.indexOf(caseId);
  return rank === -1 ? 999 : rank;
}
