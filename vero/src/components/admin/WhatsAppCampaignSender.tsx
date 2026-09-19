"use client";

import { useState, type FormEvent } from "react";
import type { ResolvedCampaignTemplate } from "@/lib/marketing-campaign-templates";

type SendState =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "done"; recipientCount: number; sent: number; failed: number; reasons: string[] }
  | { status: "error"; message: string };

export function WhatsAppCampaignSender({ templates }: { templates: ResolvedCampaignTemplate[] }) {
  const [templateId, setTemplateId] = useState<string>(templates[0]?.id ?? "");
  const [phones, setPhones] = useState("");
  const [state, setState] = useState<SendState>({ status: "idle" });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setState({ status: "sending" });

    const body = {
      templateId,
      phones: phones
        .split(/[\n,]/)
        .map((phone) => phone.trim())
        .filter(Boolean),
    };

    try {
      const response = await fetch("/api/admin/marketing/send-whatsapp", {
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
      <h3 className="text-sm font-semibold text-ink">Disparar campanha de WhatsApp</h3>
      <p className="mt-1 text-xs text-ink-soft">
        A Vero ainda não guarda telefone de ninguém automaticamente — cole abaixo os números
        (com DDI, ex: 5511999999999) de quem já topou receber mensagem.
      </p>

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

      <label className="mt-2 block text-xs font-medium text-ink-soft">
        Números (um por linha ou separados por vírgula)
        <textarea
          value={phones}
          onChange={(event) => setPhones(event.target.value)}
          rows={3}
          placeholder="5511999999999, 5511988888888"
          className="mt-1 w-full rounded-xl border border-border bg-paper px-3 py-2 text-sm text-ink"
        />
      </label>

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
