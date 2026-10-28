export type ProjectStatus = "In progress" | "Draft" | "Completed";
export type DifficultyLevel = "Beginner-Friendly" | "Intermediate" | "Advanced";

export interface Project {
  id: string;
  title: string;
  domain: string;
  status: ProjectStatus;
  description: string;
  tables: string[];
  lastAction: {
    icon: "clock" | "play" | "check";
    text: string;
  };
  actionLink: {
    text: string;
    href: string;
  };
}

export interface BusinessCase {
  id: string;
  title: string;
  difficulty: DifficultyLevel;
  domain: string;
  description: string;
  tableCount: number;
  tables: string[];
  target: string;
}

export interface StatCard {
  label: string;
  value: string;
  footer: React.ReactNode;
  icon: string;
}

export interface SQLExecution {
  status: "200 OK";
  rows: number;
  latency: number;
  query: string;
}

export interface Deliverable {
  id: string;
  title: string;
  subtitle: string;
  type: "presentation" | "pdf";
}

export const mockProjects: Project[] = [
  {
    id: "1",
    title: "Retail Sales Performance",
    domain: "Retail & E-commerce",
    status: "In progress",
    description: "Analyze sales by product, region, and time to identify quarterly revenue...",
    tables: ["orders", "products", "order_items"],
    lastAction: { icon: "clock", text: "Edited 24m ago" },
    actionLink: { text: "Open in SQL Lab →", href: "/sql-lab" },
  },
  {
    id: "2",
    title: "Customer Churn Analysis",
    domain: "Subscription SaaS",
    status: "In progress",
    description: "Cohort retention analysis isolating churn triggers following Q3...",
    tables: ["customers", "orders", "subscriptions"],
    lastAction: { icon: "play", text: "Run 2h ago" },
    actionLink: { text: "Continue Analysis →", href: "/sql-lab" },
  },
  {
    id: "3",
    title: "Marketing Campaign Effectiveness",
    domain: "Growth Marketing",
    status: "Completed",
    description: "Evaluating multi-channel acquisition ROI and CAC across paid social,...",
    tables: ["campaigns", "conversions"],
    lastAction: { icon: "check", text: "Finalized yesterday" },
    actionLink: { text: "View Deliverables →", href: "/projects/3" },
  },
  {
    id: "4",
    title: "Supply Chain Optimization",
    domain: "Operations",
    status: "Completed",
    description: "Logistics cost reduction analysis...",
    tables: ["shipments", "inventory"],
    lastAction: { icon: "check", text: "Completed last week" },
    actionLink: { text: "View Report →", href: "/projects/4" },
  },
];

export const mockBusinessCases: BusinessCase[] = [
  {
    id: "1",
    title: "Retail Sales Performance",
    difficulty: "Intermediate",
    domain: "E-Commerce / Operations",
    description: "Which products, regions, and time periods contribute...",
    tableCount: 3,
    tables: ["orders", "products", "order_items"],
    target: "Cohort Breakdown",
  },
  {
    id: "2",
    title: "Customer Churn & Retention Analysis",
    difficulty: "Advanced",
    domain: "SaaS Analytics",
    description: "What usage thresholds correlate with 30-day churn i...",
    tableCount: 4,
    tables: ["activity_logs", "orgs", "billings", "events"],
    target: "Survival Model",
  },
  {
    id: "3",
    title: "Marketing Campaign ROI & Attribution",
    difficulty: "Beginner-Friendly",
    domain: "Growth Marketing",
    description: "How does channel-level CAC compare to customer l...",
    tableCount: 2,
    tables: ["ad_spends", "customer_conversions"],
    target: "Blended ROAS",
  },
];

export const mockSQLExecutions: SQLExecution[] = [
  {
    status: "200 OK",
    rows: 14,
    latency: 118,
    query: "SELECT product_id, SUM(revenue) AS to...",
  },
  {
    status: "200 OK",
    rows: 1420,
    latency: 240,
    query: "SELECT customer_id, COUNT(*) as order...",
  },
];

export const mockDeliverables: Deliverable[] = [
  {
    id: "1",
    title: "Q3 Regional Sales Deck",
    subtitle: "Draft presentation · 14 slides",
    type: "presentation",
  },
  {
    id: "2",
    title: "Churn Risk Summary Memo",
    subtitle: "Submitted to VP Ops · PDF",
    type: "pdf",
  },
];
