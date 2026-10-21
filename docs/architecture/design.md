DataForge UI/UX Design Specification for Stitch AI
Version: 1.0 | Status: Initial baseline | Product:
DataForge
1. Purpose and usage
This is the canonical visual specification for generating consistent
DataForge screens with Stitch AI. Attach or paste this document whenever
you generate or revise a screen. Always include the Global Prompt below
plus the relevant screen brief. Generate one screen or a small related
group at a time.

The PRD (DataForge_PRD_v1.0) remains the source of truth for product
requirements. This document governs visual language, screen patterns,
and design consistency. It describes intended design; it does not claim
that the UI has been implemented.
2. Product context
DataForge is a hands-on data workbench for realistic business analysis:
business cases → projects → datasets → SQL → results → visual insights →
deliverables. Later releases add data pipelines and ML experiments.

It is not an LMS or course marketplace. Avoid course enrollment
patterns, lesson players, instructor cards, leaderboards, streaks, XP,
and excessive gamification.

Target users: beginners learning practical data analysis; intermediate
SQL/data engineering learners; aspiring data analysts, analytics
engineers, data engineers, ML practitioners, and portfolio builders.
Release priorities
- P0 Analytical MVP: workspace, projects, business cases,
  datasets, schema explorer, SQL Lab, query results/history, basic
  charts, saved work, submissions.
- P1 Data engineering: visual pipeline editor, transformations,
  data quality, run history, lineage.
- P2 Machine learning: feature preparation, baseline
  classification/regression, metrics, experiment comparison.
Do not present future features as fully functional in P0. Keep them out
of primary navigation or label them clearly as coming later.
3. Global Stitch AI prompt
Copy this prompt for every screen, then append a screen-specific brief
from Section 9.
Create a high-fidelity desktop web-app screen for DataForge, a
professional hands-on data workbench. Follow the attached DataForge
UI/UX Design Specification and the DataForge PRD. The visual direction
is Quiet Technical Premium: combine the clarity of a
well-organized database console, the analytical workflow of a notebook
environment, and the restraint of a polished productivity SaaS. Do not
copy an existing product directly.

Use a light theme for the main app, soft neutral page background,
white surfaces, subtle borders, restrained shadows, clear typography,
and indigo/blue primary actions. Use semantic green, amber, and red
only for meaningful statuses. Use consistent spacing, radius,
alignment, icons, navigation, and component styles.

DataForge is a working data environment, not a course platform.
Emphasize projects, business cases, datasets, SQL, results, insights,
and deliverables. Make the product approachable for beginners but
credible to technical users. Avoid giant decorative illustrations,
excessive gradients, unnecessary KPI cards, and gamification.

Use a desktop-first 1440px-wide layout unless otherwise specified.
Create a realistic product screen, not a mood board. Use coherent
sample content, real-looking tables, meaningful labels, and plausible
states---not lorem ipsum. Keep it implementation-friendly for Next.js,
React, TypeScript, Tailwind CSS, and shadcn/ui. Do not invent
unspecified features or change global tokens/navigation without
permission.

The result must look like another screen from the same DataForge
application. Preserve the established design system and information
architecture.

4. Design principles
1. Work-first: business cases are entry points into practical
   projects, not courses.
2. Progressive disclosure: prioritize core actions; put advanced
   details in tabs, menus, or expandable panels.
3. One clear primary action: e.g. Create project, Start analysis,
   Run query, Save chart.
4. Feedback matters: design loading, running, success, empty,
   error, cancelled, and timeout states where relevant.
5. Data readability first: readable tables, aligned numbers, clear
   column headers, compact rows, sensible formatting.
6. Explainable UX: consistent terminology, actionable error
   messages, predictable navigation.
7. Implementation realism: prefer reusable components and
   achievable layouts over decorative concepts.
5. Design tokens
Treat these as the initial canonical values. If a formal Figma library
is approved later, update this section and use it consistently.
Color
  Token                Value       Usage
  Primary              #4F46E5   Primary buttons, selected navigation, links
  Primary hover        #4338CA   Hover on primary actions
  Page background      #F8FAFC   Main app background
  Surface              #FFFFFF   Cards, panels, dialogs
  Muted surface        #F1F5F9   Secondary/inset areas
  Primary text         #0F172A   Headings and body
  Secondary text       #64748B   Metadata and helper text
  Disabled text        #94A3B8   Disabled labels
  Border               #E2E8F0   Default borders and dividers
  Strong border        #CBD5E1   Inputs and stronger boundaries
  Success              #15803D   Successful status
  Success background   #F0FDF4   Success feedback
  Warning              #B45309   Warnings
  Warning background   #FFFBEB   Warning feedback
  Danger               #B91C1C   Errors/destructive actions
  Danger background    #FEF2F2   Error feedback
  Info                 #0369A1   Informational states
  Info background      #F0F9FF   Informational feedback

Do not use semantic colors decoratively or rely on color alone to
communicate status. Charts must use distinguishable, accessible colors.
Typography
Preferred UI font: Inter or Geist Sans. Use one consistently.
Use Geist Mono or JetBrains Mono for SQL/code.

  Role                       Size   Weight
  Page title             28--32px      600
  Section heading        18--20px      600
  Panel/card heading     14--16px      600
  Body                       14px      400
  Helper/metadata        12--13px      400
  Table header           12--13px      600
  SQL/code               13--14px      400

Use sentence case. Avoid excessive uppercase labels.
Spacing and shape
Use a 4px base scale: 4, 8, 12, 16, 20, 24, 32, 40px. Buttons/inputs
radius 8px; cards/panels 10--12px; dialogs 12px. Use 1px subtle borders
and restrained shadows only for floating elements. Prefer borders and
surface contrast over heavy shadows.
Desktop layout
For 1440px width: sidebar approximately 232--248px; top bar 56--64px
where needed; content padding 24--32px; standard content max-width
1200--1320px. SQL Lab may use all available width. These are defaults,
not rigid constraints.
Icons
Use a consistent outline icon set, preferably Lucide-style. Pair icons
with labels for unfamiliar actions. Do not mix icon styles arbitrarily.
6. Shared application shell
Authenticated screens
- Persistent left sidebar with DataForge wordmark.
- Navigation, in this exact order: Overview, My Projects,
  Explore Cases, Datasets.
- Tools, in this order: SQL Lab, Insights, Pipelines
  (future/P1), ML Lab (future/P2).
- Settings and user profile near the bottom.
- Highlight current navigation item consistently.
- Use breadcrumbs inside projects/cases.
- Page title and short description at top of main content; primary
  action aligned consistently near the title.
- Use the same sidebar dimensions, typography, icon style, and spacing
  across authenticated screens.
Public screens
Landing/login/registration may omit the authenticated sidebar, but must
use the same brand colors, typography, and component styles.
7. Shared components
- Primary button: solid indigo with white label.
- Secondary button: neutral/white with visible border.
- Ghost button: low-emphasis action.
- Destructive button: red only for destructive operations.
- Inputs: persistent labels, clear focus/error/disabled states;
  placeholders are not labels.
- Cards: group related content, 16--20px internal padding, simple
  borders.
- Tables: clear headers, subtle separators, consistent numeric
  alignment, predictable row actions, empty/loading/error/populated
  states, horizontal overflow or pagination when necessary.
- Status badges: compact text labels, e.g. Draft, In progress,
  Running, Completed, Failed, Cancelled, Submitted.
- Empty states: short heading + explanation + one useful next
  action; no giant illustration.
- Feedback: inline messages for contextual errors, toasts for
  brief confirmations, dialogs for consequential actions, execution
  panels for detailed logs.
- Dialogs: explicit action and consequence; use labels like
  "Cancel execution" or "Delete project".
- Accessibility: readable contrast, visible keyboard focus, labels
  on fields, clickable targets, status not communicated by color
  alone.
8. Shared sample content
Use coherent illustrative sample data across related screens.

Sample project: Retail Sales Performance
Description: Analyze sales by product, region, and time to identify
revenue trends.

Sample business cases: Retail Sales Performance; Customer Churn
Analysis; Marketing Campaign Effectiveness.

Sample datasets: orders, order_items, customers, products,
campaigns.

Example orders columns: order_id, customer_id, order_date,
product_id, quantity, revenue, region.

Statuses: Draft, In progress, Running, Completed, Failed, Cancelled,
Submitted.

Do not invent real system metrics, guaranteed performance, exact
evaluation scores, or fixed row counts. If illustrative numbers are
needed, treat them as sample data.
9. Screen-specific Stitch prompts
Append one prompt below after the Global Stitch AI prompt.
A. Workspace overview
Design the authenticated DataForge overview at 1440px. Include a
greeting, concise explanation, primary "Create project" button,
"Continue working" project cards/table, "Explore business cases"
section, and compact recent activity if space permits. Use examples
"Retail Sales Performance" and "Customer Churn Analysis". Each project
should show context, status, and last activity. Case cards should show
business question, domain, difficulty, and dataset availability. Keep
it work-oriented; no course progress rings, XP, streaks, or
leaderboards.

B. My Projects
Include page title "My Projects", concise description, "Create
project" primary action, search, simple status filter, and a
table/list with project name, linked business case, status, last
updated, and row actions. Include a helpful empty state. Do not turn
this into a kanban board unless explicitly requested.

C. Explore Cases
Design a business case library with title "Explore Cases", short
intro, search, filters for domain/difficulty/skills, and restrained
cards or list rows. Each case includes title, business question,
summary, domain, difficulty, dataset count, and "View case". Example
cases: Retail Sales Performance, Customer Churn Analysis, Marketing
Campaign Effectiveness. No instructor names, lesson counts, course
ratings, or enrollment buttons.

D. Business case detail
Include breadcrumb Explore Cases / \(Case Name\), title, domain,
difficulty, scenario summary, clearly presented business question,
analytical objectives, available datasets, expected deliverables,
acceptance criteria, optional expandable hints, and primary "Start
analysis" action. Example: Retail Sales Performance; question: "Which
products, regions, and time periods contribute most to changes in
revenue?" Do not reveal a complete solution or invent evaluation
rules.

E. Project overview
Show breadcrumb and project name, status, linked business case,
primary actions "Open SQL Lab" and "Add deliverable" where
appropriate, project objective, datasets, recent saved queries,
deliverables and statuses, and recent activity if useful. Make the
next action obvious and avoid redundant cards.

F. Dataset catalog
Include title "Datasets", search, simple filters, and a table/list
with dataset name, description, source/category, row count, column
count, and availability. Include inspect action and
empty/loading/error states. Use tables like orders, customers,
products, and order_items. Never show internal storage paths or
credentials.

G. Dataset detail / schema explorer
Show dataset title and description, row/column count and last-updated
metadata where available, tabs "Preview" and "Schema", schema table
with column name, data type, nullable indicator and description if
available, preview table with realistic values, and action "Open in
SQL Lab". Example orders fields: order_id, customer_id,
order_date, product_id, quantity, revenue. Keep schema names
and values visually distinct.

H. SQL Lab --- primary screen
Design the signature DataForge SQL Lab at 1440px. Use the app shell
but let the workspace use available width. Top toolbar: project
breadcrumb/name, active dataset context, execution status, primary
"Run query", secondary "Save query". Left utility panel:
searchable/expandable schema explorer. Main area: SQL editor with
syntax highlighting, line numbers and monospace type. Bottom results
area: tabs "Results", "Chart", "Execution details". Results tab
includes compact table, row count and execution duration when
available. Execution details show status, duration, and actionable
errors.

Use this illustrative SQL:
SELECT product_id, SUM(revenue) AS total_revenue FROM orders GROUP BY product_id ORDER BY total_revenue DESC;

Keep editor and results visually distinct; panels should be
resizable/collapsible in the intended interaction design. "Run query"
is the strongest action. Do not add unrelated AI chat, workflow
canvases, or dozens of toolbar icons. Do not show success and error
states at the same time.

I. SQL Lab --- running state
Create a state variant of the existing SQL Lab screen. Preserve
layout, editor, schema panel, and all content not related to
execution. Show "Running", restrained progress indicator, and "Cancel
query" if supported. Results area explains that results will appear
when execution finishes. Do not invent a percentage-complete value if
actual progress is unavailable.

J. SQL Lab --- error state
Create an error variant of the established SQL Lab screen. Preserve
the user's query and the full layout. Show a specific actionable
message near execution output, e.g. "Column reveneu was not found.
Check the column name or inspect the schema." Include a next step such
as "Review schema" or "Edit query". No generic full-page red error.

K. Insights / chart builder
Include project context, selected saved query/result set, chart type
selector, dimension and metric selectors, large chart preview, chart
title/description, actions "Save chart" and "Add to deliverable", and
a small data preview if useful. Use readable axes/legends and
restrained colors. No 3D charts or decorative metrics unsupported by
the data.

L. Deliverables / submission
Include title "Deliverables", grouped/table view of saved queries,
charts, and written findings; statuses Draft/Submitted; last-updated
timestamps; actions to open/edit/submit; and a confirmation dialog
explaining what is submitted. Keep it artifact-focused, not
school-grade or gamified.

M. Pipeline Studio --- future P1
Design a future Pipeline Studio using the same system. Show left
data-source/transformation panel, central node canvas, right
configuration panel, top toolbar with pipeline name/save/run, and
execution status/logs. Example flow: orders dataset → clean columns →
aggregate revenue → output table. Prioritize readable nodes and
connections; avoid colorful clutter. Clearly treat this as future
scope.

N. ML Lab --- future P2
Design a future ML Lab for beginner-friendly baseline experiments.
Include dataset and target column, task type
classification/regression, compact model configuration, run experiment
action, appropriate metrics (e.g. accuracy/F1 or MAE/RMSE), and
experiment history/comparison. Do not imply one metric proves model
quality. Use the same app shell; no course-style tutorial interface.

O. Login / registration
Design a clean DataForge authentication screen using the same brand.
Include wordmark, clear heading, email/password fields, primary
action, validation/error states, and login/registration switch links
as relevant. Keep decoration minimal and do not introduce a separate
palette or oversized marketing illustration.

10. Interaction states
Consider these states for every relevant component: default, hover,
keyboard focus, selected, loading, empty, success, error, disabled,
running, cancelled, and timeout. Do not combine mutually exclusive
states in one screenshot. Generate separate variants when the visual
changes materially.
11. Responsive behavior
- Desktop (1280px+): persistent sidebar; multi-panel SQL Lab; full
  tables and chart controls.
- Tablet (768--1279px): collapsible sidebar; panels can
  collapse/stack; tables may scroll horizontally.
- Mobile (<768px): drawer navigation; stacked cards/forms;
  preserve browsing and project access; do not force the full
  multi-panel SQL IDE into a narrow screen. Adapt complex workflows
  rather than simply shrinking the desktop layout.
12. Iteration prompt
Use this for targeted revisions:
Update the existing DataForge screen using the current design as the
source of truth. Preserve the global tokens, app shell, navigation,
typography, spacing, and every element not explicitly mentioned below.

Requested changes: \(list exact changes\)

Must remain unchanged: \(list elements to preserve\)

Do not redesign from scratch, add unrelated features, or introduce a
new visual language. Keep the result consistent with the DataForge
UI/UX Design Specification.

13. Design review checklist
Before accepting a generated screen, verify: - It looks like DataForge
and matches other screens. - Tokens, typography, spacing, icon style,
and navigation are consistent. - It supports a real data-work task and
is not LMS-like. - The primary action is obvious. - Tables and technical
content are readable. - Empty/loading/error/success states are
considered. - Features match P0/P1/P2 scope. - The layout can be
implemented with reusable React components. - Sample content is coherent
and illustrative. - No unsupported metrics or invented features are
presented as real.
14. Suggested Figma file structure
1. 00 — Cover & Product Principles
2. 01 — Foundations
3. 02 — Components
4. 03 — App Shell
5. 04 — P0 Workspace & Projects
6. 05 — P0 Case Library & Detail
7. 06 — P0 Datasets
8. 07 — P0 SQL Lab
9. 08 — P0 Insights & Deliverables
10. 09 — States & Responsive
11. 10 — P1 Pipeline Studio
12. 11 — P2 ML Lab
13. 12 — Archive & Experiments
Keep approved components separate from explorations. Mark future screens
clearly.
15. Screen generation order
1. Foundations and app shell.
2. Workspace overview.
3. My Projects.
4. Explore Cases.
5. Case detail.
6. Project overview.
7. Dataset catalog.
8. Dataset detail/schema.
9. SQL Lab default state.
10. SQL Lab running/error variants.
11. Insights.
12. Deliverables.
13. Responsive states.
14. Pipeline Studio after P0 is stable.
15. ML Lab after pipeline foundations are stable.
Approve the app shell and SQL Lab before generating every other screen.
16. Open design decisions
Validate these before calling the design system final: - Final logo and
brand identity. - Light or dark default editor theme. - Sidebar collapse
behavior. - Multiple-workspace support. - Whether case evaluation
appears in P0. - P0 chart types. - Navigation location for saved queries
and deliverables. - Responsive SQL Lab behavior. - Final status
vocabulary and permission-dependent actions.

Until confirmed, use the defaults in this document. Do not create
conflicting screen variants.
17. Final rule for AI design tools
Prioritize consistency, task clarity, data readability, realistic
behavior, and implementation feasibility over novelty. Do not redesign
the brand or invent patterns without approval. If a screen requirement
conflicts with this document or the PRD, identify the conflict and
recommend the smallest coherent adjustment before proceeding.