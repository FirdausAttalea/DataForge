import { DEMO_SQL } from "./fixtures";

export interface BasicSyntaxCheck {
  valid: boolean;
  message?: string;
}

export interface CursorPosition {
  lineNumber: number;
  column: number;
}

const KEYWORDS = new Set([
  "SELECT", "FROM", "WHERE", "GROUP", "BY", "ORDER", "LIMIT", "DESC", "ASC", "AS",
  "HAVING", "JOIN", "LEFT", "RIGHT", "INNER", "OUTER", "ON", "AND", "OR", "NOT",
  "IN", "IS", "NULL", "DISTINCT", "SUM", "COUNT", "AVG", "MIN", "MAX", "ROUND",
  "CASE", "WHEN", "THEN", "ELSE", "END", "UNION", "ALL", "WITH", "OVER", "PARTITION",
]);

/** Normalize SQL for prototype demo-query matching only (never executed). */
export function normalizeSql(sql: string): string {
  return sql.replace(/\s+/g, " ").trim().toLowerCase();
}

export function isDemoQuery(sql: string): boolean {
  return normalizeSql(sql) === normalizeSql(DEMO_SQL);
}

/**
 * Basic prototype check: empty input or unbalanced parentheses outside strings
 * and comments. This is not a SQL parser and must not be represented as one.
 */
export function checkBasicSyntax(sql: string): BasicSyntaxCheck {
  if (!sql.trim()) {
    return { valid: false, message: "Query is empty." };
  }

  let depth = 0;
  let line = 1;
  let inSingle = false;
  let inDouble = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < sql.length; i += 1) {
    const char = sql[i];
    const next = sql[i + 1];

    if (char === "\n") {
      line += 1;
      inLineComment = false;
      continue;
    }
    if (inLineComment) continue;
    if (inBlockComment) {
      if (char === "*" && next === "/") {
        inBlockComment = false;
        i += 1;
      }
      continue;
    }
    if (inSingle) {
      if (char === "'" && next === "'") {
        i += 1;
      } else if (char === "'") {
        inSingle = false;
      }
      continue;
    }
    if (inDouble) {
      if (char === '"') inDouble = false;
      continue;
    }

    if (char === "-" && next === "-") {
      inLineComment = true;
      i += 1;
    } else if (char === "/" && next === "*") {
      inBlockComment = true;
      i += 1;
    } else if (char === "'") {
      inSingle = true;
    } else if (char === '"') {
      inDouble = true;
    } else if (char === "(") {
      depth += 1;
    } else if (char === ")") {
      depth -= 1;
      if (depth < 0) {
        return { valid: false, message: `Unbalanced closing parenthesis on line ${line}.` };
      }
    }
  }

  if (inSingle || inDouble) {
    return { valid: false, message: "Unterminated string literal." };
  }
  if (inBlockComment) {
    return { valid: false, message: "Unterminated block comment." };
  }
  if (depth > 0) {
    return { valid: false, message: "Unbalanced opening parenthesis." };
  }
  return { valid: true };
}

/**
 * Basic formatter: uppercases SQL keywords outside comments and string literals.
 * It intentionally does not reindent or validate the statement.
 */
export function formatSqlBasic(sql: string): string {
  let result = "";
  let i = 0;
  let inLineComment = false;
  let inBlockComment = false;
  let inSingle = false;
  let inDouble = false;

  while (i < sql.length) {
    const char = sql[i];
    const next = sql[i + 1];

    if (char === "\n") {
      inLineComment = false;
      result += char;
      i += 1;
      continue;
    }
    if (inLineComment) {
      result += char;
      i += 1;
      continue;
    }
    if (inBlockComment) {
      result += char;
      if (char === "*" && next === "/") {
        result += next;
        i += 2;
        inBlockComment = false;
      } else {
        i += 1;
      }
      continue;
    }
    if (inSingle) {
      result += char;
      if (char === "'" && next === "'") {
        result += next;
        i += 2;
      } else {
        if (char === "'") inSingle = false;
        i += 1;
      }
      continue;
    }
    if (inDouble) {
      result += char;
      if (char === '"') inDouble = false;
      i += 1;
      continue;
    }

    if (char === "-" && next === "-") {
      inLineComment = true;
      result += "--";
      i += 2;
      continue;
    }
    if (char === "/" && next === "*") {
      inBlockComment = true;
      result += "/*";
      i += 2;
      continue;
    }
    if (char === "'") {
      inSingle = true;
      result += char;
      i += 1;
      continue;
    }
    if (char === '"') {
      inDouble = true;
      result += char;
      i += 1;
      continue;
    }

    if (/[A-Za-z_]/.test(char)) {
      let end = i + 1;
      while (end < sql.length && /[A-Za-z0-9_]/.test(sql[end])) end += 1;
      const word = sql.slice(i, end);
      result += KEYWORDS.has(word.toUpperCase()) ? word.toUpperCase() : word;
      i = end;
      continue;
    }

    result += char;
    i += 1;
  }

  return result;
}

/** Returns a 1-based line/column cursor from the editor. */
export function formatCursor(position: CursorPosition): string {
  return `Ln ${position.lineNumber}, Col ${position.column}`;
}

/** The sample query expects ten rows; the UI keeps this limit visible by design. */
export const DEFAULT_LIMIT = 10;
export const LIMIT_OPTIONS = [10, 100, 1000, 10000] as const;

export function clampLimit(value: number): number {
  return LIMIT_OPTIONS.includes(value as (typeof LIMIT_OPTIONS)[number]) ? value : 10;
}
