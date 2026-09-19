"use client";

import { useState, type FormEvent } from "react";
import type { ResolvedCampaignTemplate } from "@/lib/marketing-campaign-templates";
import type { RecipientSegment } from "@/lib/marketing-recipients";

type SendState =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "done"; recipientCount: number; sent: number; failed: number; reasons: string[] }
  | { status: "error"; message: string };

export function MarketingCampaignSender({
  templates,
  segments,
}: {
  templates: ResolvedCampaignTemplate[];
  segments: { id: RecipientSegment; label: string }[];
}) {
  const [templateId, setTemplateId] = useState<string>(templates[0]?.id ?? "");
  const [mode, setMode] = useState<"segment" | "manual">("segment");
  const [segment, setSegment] = useState<RecipientSegment>(segments[0]?.id ?? "waitlist-clientes");
  const [manualEmails, setManualEmails] = useState("");
  const [state, setState] = useState<SendState>({ status: "idle" });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setState({ status: "sending" });

    const body =
      mode === "segment"
        ? { templateId, segment }
        : {
            templateId,
            manualEmails: manualEmails
              .split(/[\n,]/)
              .map((email) => email.trim())
              .filter(Boolean),
          };

    try {
      const response = await fetch("/api/admin/marketing/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await response.json();

      if (!response.ok) {
        setState({ status: "error", message: json.error ?? "Não foi possível enviar." });
        return;
      }

      setState({
        status: "done",
        recipientCount: json.recipientCount,
        sent: json.sent,
        failed: json.failed,
        reasons: json.reasons ?? [],
      });
    } catch {
      setState({ status: "error", message: "Falha de rede ao enviar a campanha." });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-paper p-5">
      <h3 className="text-sm font-semibold text-ink">Disparar campanha de email</h3>

      <label className="mt-3 block text-xs font-medium text-ink-soft">
        Modelo
        <select
          value={templateId}
          onChange={(event) => setTemplateId(event.target.value)}
          className="mt-1 w-full rounded-xl border border-border bg-paper px-3 py-2 text-sm text-ink"
        >
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.stage} — {template.label}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-3 flex gap-4 text-xs font-medium text-ink-soft">
        <label className="flex items-center gap-1.5">
          <input
            type="radio"
            checked={mode === "segment"}
            onChange={() => setMode("segment")}
          />
          Segmento cadastrado
        </label>
        <label className="flex items-center gap-1.5">
          <input type="radio" checked={mode === "manual"} onChange={() => setMode("manual")} />
          Lista manual
        </label>
      </div>

      {mode === "segment" ? (
        <label className="mt-2 block text-xs font-medium text-ink-soft">
          Destinatários
          <select
            value={segment}
            onChange={(event) => setSegment(event.target.value as RecipientSegment)}
            className="mt-1 w-full rounded-xl border border-border bg-paper px-3 py-2 text-sm text-ink"
          >
            {segments.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <label className="mt-2 block text-xs font-medium text-ink-soft">
          Emails (um por linha ou separados por vírgula)
          <textarea
            value={manualEmails}
            onChange={(event) => setManualEmails(event.target.value)}
            rows={3}
            placeholder="ana@exemplo.com, bruno@exemplo.com"
            className="mt-1 w-full rounded-xl border border-border bg-paper px-3 py-2 text-sm text-ink"
          />
        </label>
      )}

      <button
        type="submit"
        disabled={state.status === "sending"}
        className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-paper transition hover:bg-primary-dark disabled:opacity-60"
      >
        {state.status === "sending" ? "Enviando..." : "Enviar campanha"}
      </button>

      {state.status === "done" && (
        <p className="mt-3 text-xs text-ink-soft">
          {state.recipientCount} destinatário(s) — {state.sent} enviado(s), {state.failed} não
          enviado(s)
          {state.reasons.length > 0 && ` (motivo: ${state.reasons.join(", ")})`}.
        </p>
      )}
      {state.status === "error" && (
        <p className="mt-3 text-xs text-red-600">{state.message}</p>
      )}
    </form>
  );
}
