import type { UserRole } from "./types";

export function getRecommendedCaseForRole(role: UserRole): string {
  const mapping: Record<UserRole, string> = {
    learner: "case-marketing-roi",
    data_analyst: "case-retail-sales",
    analytics_engineer: "case-churn-retention",
  };
  return mapping[role];
}

export function getCaseRankForRole(caseId: string, role: UserRole): number {
  const rankings: Record<UserRole, string[]> = {
    learner: ["case-marketing-roi", "case-retail-sales", "case-churn-retention"],
    data_analyst: ["case-retail-sales", "case-marketing-roi", "case-churn-retention"],
    analytics_engineer: ["case-churn-retention", "case-retail-sales", "case-marketing-roi"],
  };
  const rank = rankings[role].indexOf(caseId);
  return rank === -1 ? 999 : rank;
}
