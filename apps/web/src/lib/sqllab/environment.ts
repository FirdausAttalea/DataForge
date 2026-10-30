import type { ProjectEnvironment } from "@/lib/store";

export function getEnvironmentLabel(environment: ProjectEnvironment): string {
  switch (environment) {
    case "staging":
      return "Staging Replica";
    case "development":
      return "Development Replica";
    case "production":
    default:
      return "Production Replica";
  }
}
