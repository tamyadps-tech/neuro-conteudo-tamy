"use client";

import { useState } from "react";
import type { ResolvedCampaignTemplate } from "@/lib/marketing-campaign-templates";

const STAGE_COLOR: Record<ResolvedCampaignTemplate["stage"], string> = {
  Venda: "bg-primary/10 text-primary",
  Acompanhamento: "bg-amber-100 text-amber-800",
  "Pós-venda": "bg-emerald-100 text-emerald-800",
};

export function MarketingTemplateCard({ template }: { template: ResolvedCampaignTemplate }) {
  const [copied, setCopied] = useState<"assunto" | "email" | "whatsapp" | null>(null);

  async function copy(text: string, which: "assunto" | "email" | "whatsapp") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard pode falhar — o texto continua visível pra copiar manualmente.
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-paper p-5">
      <div className="flex items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STAGE_COLOR[template.stage]}`}
        >
          {template.stage}
        </span>
        <h3 className="text-sm font-semibold text-ink">{template.label}</h3>
      </div>
      <p className="mt-1 text-xs text-ink-soft">{template.description}</p>

      <div className="mt-4 rounded-xl border border-border bg-paper-alt/40 p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
          Email — assunto
        </p>
        <p className="mt-1 text-sm text-ink">{template.email.subject}</p>
        <button
          type="button"
          onClick={() => copy(template.email.subject, "assunto")}
          className="mt-2 rounded-lg border border-border px-3 py-1 text-xs font-medium text-ink hover:bg-paper"
        >
          {copied === "assunto" ? "Copiado!" : "Copiar assunto"}
        </button>
      </div>

      <div className="mt-3 rounded-xl border border-border bg-paper-alt/40 p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
          Email — corpo (HTML)
        </p>
        <button
          type="button"
          onClick={() => copy(template.email.html, "email")}
          className="mt-2 rounded-lg border border-border px-3 py-1 text-xs font-medium text-ink hover:bg-paper"
        >
          {copied === "email" ? "Copiado!" : "Copiar HTML do email"}
        </button>
      </div>

      <div className="mt-3 rounded-xl border border-border bg-paper-alt/40 p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
          WhatsApp
        </p>
        <p className="mt-1 text-sm text-ink">{template.whatsapp}</p>
        <button
          type="button"
          onClick={() => copy(template.whatsapp, "whatsapp")}
          className="mt-2 rounded-lg border border-border px-3 py-1 text-xs font-medium text-ink hover:bg-paper"
        >
          {copied === "whatsapp" ? "Copiado!" : "Copiar mensagem"}
        </button>
      </div>
    </div>
  );
}
