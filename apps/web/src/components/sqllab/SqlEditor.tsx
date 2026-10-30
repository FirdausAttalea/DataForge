"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { OnMount } from "@monaco-editor/react";
import { loader } from "@monaco-editor/react";
import type { CursorPosition } from "@/lib/sqllab/sql";

const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((module) => module.default),
  {
    ssr: false,
    loading: () => null,
  }
);

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  onCursorChange: (position: CursorPosition) => void;
}

let languageRegistered = false;

function registerLanguage(monaco: Parameters<OnMount>[1]) {
  if (!languageRegistered) {
    monaco.languages.register({ id: "dataforge-sql" });
    monaco.languages.setMonarchTokensProvider("dataforge-sql", {
      defaultToken: "",
      tokenPostfix: ".sql",
      keywords: [
        "SELECT", "FROM", "WHERE", "GROUP", "BY", "ORDER", "LIMIT", "DESC", "ASC",
        "AS", "HAVING", "JOIN", "LEFT", "RIGHT", "INNER", "OUTER", "ON", "AND",
        "OR", "NOT", "IN", "IS", "NULL", "DISTINCT", "CASE", "WHEN", "THEN",
        "ELSE", "END", "UNION", "ALL", "WITH", "OVER", "PARTITION",
      ],
      aggregates: ["SUM", "COUNT", "AVG", "MIN", "MAX", "ROUND"],
      tokenizer: {
        root: [
          { include: "@comments" },
          [/\bAS\b/i, { token: "keyword", next: "@aliasState" }],
          [/[a-zA-Z_][\w$]*/, {
            cases: {
              "@keywords": "keyword",
              "@aggregates": "predefined",
              "@default": "identifier",
            },
          }],
          [/'([^'\\]|\\.)*'/, "string"],
          [/"/, "string", "@doubleQuotedString"],
          [/\d+(\.\d+)?/, "number"],
          [/[;,.]/, "delimiter"],
          [/[()]/, "@brackets"],
        ],
        "aliasState": [
          { include: "@whitespace" },
          [/[a-zA-Z_][\w$]*/, "alias", "@pop"],
          [/./, "", "@pop"],
        ],
        comments: [
          [/--+.*$/, "comment"],
          [/\/\*/, "comment", "@comment"],
        ],
        comment: [
          [/[^*/]+/, "comment"],
          [/\*\//, "comment", "@pop"],
          [/./, "comment"],
        ],
        doubleQuotedString: [
          [/[^"]+/, "string"],
          [/"/, "string", "@pop"],
        ],
        whitespace: [
          [/\s+/, "white"],
        ],
      },
    });
    languageRegistered = true;
  }

  monaco.editor.defineTheme("dataforge-sql", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "4f46e5", fontStyle: "bold" },
      { token: "predefined", foreground: "4f46e5", fontStyle: "bold" },
      { token: "alias", foreground: "b45309" },
      { token: "comment", foreground: "94a3b8", fontStyle: "italic" },
      { token: "string", foreground: "047857" },
      { token: "number", foreground: "7c3aed" },
      { token: "delimiter", foreground: "64748b" },
    ],
    colors: {
      "editor.background": "#ffffff",
      "editor.foreground": "#334155",
      "editorLineNumber.foreground": "#cbd5e1",
      "editorLineNumber.activeForeground": "#64748b",
      "editor.lineHighlightBackground": "#f8fafc",
      "editor.selectionBackground": "#c7d2fe66",
      "editor.inactiveSelectionBackground": "#e0e7ff55",
      "editorCursor.foreground": "#4f46e5",
      "editorIndentGuide.background1": "#f1f5f9",
      "scrollbarSlider.background": "#cbd5e133",
      "scrollbarSlider.hoverBackground": "#cbd5e166",
      "scrollbarSlider.activeBackground": "#94a3b855",
    },
  });
}

export function SqlEditor({ value, onChange, onCursorChange }: SqlEditorProps) {
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let active = true;
    loader
      .init()
      .then(() => {
        if (active) setState("ready");
      })
      .catch(() => {
        if (active) setState("failed");
      });
    return () => {
      active = false;
    };
  }, []);

  const handleMount: OnMount = (editor) => {
    editor.updateOptions({ theme: "dataforge-sql" });
    editor.onDidChangeCursorPosition((event) => {
      onCursorChange({
        lineNumber: event.position.lineNumber,
        column: event.position.column,
      });
    });
    const position = editor.getPosition();
    if (position) {
      onCursorChange({ lineNumber: position.lineNumber, column: position.column });
    }
  };

  if (state !== "ready") {
    return (
      <div className="relative h-full min-h-[260px]">
        <label htmlFor="sql-editor-fallback" className="sr-only">
          SQL editor fallback
        </label>
        <textarea
          id="sql-editor-fallback"
          ref={textareaRef}
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            const before = event.target.value.slice(0, event.target.selectionStart).split("\n");
            onCursorChange({
              lineNumber: before.length,
              column: (before[before.length - 1]?.length ?? 0) + 1,
            });
          }}
          spellCheck={false}
          aria-label="SQL query"
          className="h-full min-h-[260px] w-full resize-none rounded-b-xl border-0 bg-white p-4 font-mono text-[13px] leading-6 text-slate-700 outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
        />
        <span className="pointer-events-none absolute bottom-2 right-3 rounded bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500">
          {state === "failed" ? "Plain-text fallback · editor failed to load" : "Loading editor… plain-text fallback active"}
        </span>
      </div>
    );
  }

  return (
    <MonacoEditor
      key="sql-editor"
      height="100%"
      language="dataforge-sql"
      theme="dataforge-sql"
      value={value}
      onChange={(next) => onChange(next ?? "")}
      beforeMount={registerLanguage}
      onMount={handleMount}
      loading={null}
      options={{
        minimap: { enabled: false },
        lineNumbers: "on",
        lineNumbersMinChars: 3,
        glyphMargin: false,
        folding: false,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
        fontSize: 13,
        lineHeight: 24,
        fontLigatures: false,
        padding: { top: 14, bottom: 14 },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        renderLineHighlight: "line",
        scrollbar: {
          verticalScrollbarSize: 8,
          horizontalScrollbarSize: 8,
          useShadows: false,
        },
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
        wordWrap: "off",
        tabSize: 2,
        insertSpaces: true,
        contextmenu: true,
        suggestOnTriggerCharacters: true,
        fixedOverflowWidgets: true,
      }}
    />
  );
}
