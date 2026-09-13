"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  PROFESSIONAL_CATEGORIES,
  CATEGORY_LABELS,
} from "@/lib/professional-categories";
import { SESSION_FORMATS, SESSION_FORMAT_LABELS } from "@/lib/session-format";

const fieldClass =
  "rounded-xl border border-border bg-paper px-4 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";

export function ProfessionalFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/profissionais${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <input
        type="search"
        defaultValue={searchParams.get("q") ?? ""}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            updateParam("q", (event.target as HTMLInputElement).value);
          }
        }}
        placeholder="Buscar por nome ou especialidade…"
        aria-label="Buscar profissionais"
        className={`${fieldClass} flex-1 min-w-[200px]`}
      />
      <select
        value={searchParams.get("category") ?? ""}
        onChange={(event) => updateParam("category", event.target.value)}
        aria-label="Filtrar por categoria"
        className={fieldClass}
      >
        <option value="">Todas as categorias</option>
        {PROFESSIONAL_CATEGORIES.map((value) => (
          <option key={value} value={value}>
            {CATEGORY_LABELS[value]}
          </option>
        ))}
      </select>
      <select
        value={searchParams.get("format") ?? ""}
        onChange={(event) => updateParam("format", event.target.value)}
        aria-label="Filtrar por formato de atendimento"
        className={fieldClass}
      >
        <option value="">Online ou presencial</option>
        {SESSION_FORMATS.map((value) => (
          <option key={value} value={value}>
            {SESSION_FORMAT_LABELS[value]}
          </option>
        ))}
      </select>
    </div>
  );
}
