"use client";

import {
  Clock,
  Columns3,
  DollarSign,
  Hash,
  KeyRound,
  Link2,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import type { TableColumn } from "@/lib/store";
import { TypeBadge } from "./TypeBadge";

function iconFor(column: TableColumn): { Icon: LucideIcon; tone: string } {
  if (column.key === "primary") return { Icon: KeyRound, tone: "text-orange-500" };
  if (column.key === "foreign") return { Icon: Link2, tone: "text-slate-400" };
  if (/TIME|DATE/i.test(column.dataType)) return { Icon: Clock, tone: "text-slate-400" };
  if (/revenue|amount|price|value/i.test(column.name)) return { Icon: DollarSign, tone: "text-green-600" };
  if (/region|country|segment/i.test(column.name)) return { Icon: MapPin, tone: "text-slate-400" };
  if (/quantity|count|inventory/i.test(column.name)) return { Icon: Hash, tone: "text-slate-400" };
  return { Icon: Columns3, tone: "text-slate-400" };
}

interface ColumnRowProps {
  column: TableColumn;
  level?: number;
}

export function ColumnRow({ column, level = 3 }: ColumnRowProps) {
  const { Icon, tone } = iconFor(column);
  return (
    <li
      role="treeitem"
      aria-level={level}
      aria-selected={false}
      aria-label={`${column.name}, ${column.dataType}${column.key === "primary" ? ", primary key" : column.key === "foreign" ? ", foreign key" : ""}`}
      tabIndex={0}
      className="flex items-center gap-2 rounded-md py-1 pl-9 pr-2 text-slate-600 outline-none transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
    >
      <Icon size={14} className={`shrink-0 ${tone}`} aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate font-mono text-xs">{column.name}</span>
      <TypeBadge type={column.dataType} />
      {column.key === "primary" && (
        <span className="rounded bg-orange-50 px-1 py-0.5 text-[9px] font-bold text-orange-600">PK</span>
      )}
      {column.key === "foreign" && (
        <span className="rounded bg-slate-100 px-1 py-0.5 text-[9px] font-bold text-slate-500">FK</span>
      )}
    </li>
  );
}
