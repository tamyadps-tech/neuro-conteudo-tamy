"use client";

import { useState, type FormEvent } from "react";
import type { ResolvedProfessionalCampaignTemplate } from "@/lib/professional-campaign-templates";

type ClientOption = { id: string; full_name: string; email: string };

type SendState =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "done"; recipientCount: number; sent: number; failed: number; reasons: string[] }
  | { status: "error"; message: string };

export function ProfessionalMarketingComposer({
  token,
  templates,
  clients,
}: {
  token: string;
  templates: ResolvedProfessionalCampaignTemplate[];
  clients: ClientOption[];
}) {
  const [channel, setChannel] = useState<"email" | "whatsapp">("email");
  const [templateId, setTemplateId] = useState<string>(templates[0]?.id ?? "");
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [phones, setPhones] = useState("");
  const [state, setState] = useState<SendState>({ status: "idle" });

  const template = templates.find((t) => t.id === templateId) ?? templates[0];

  function toggleClient(id: string) {
    setSelectedClientIds((current) =>
      current.includes(id) ? current.filter((c) => c !== id) : [...current, id]
    );
  }

  function toggleAllClients() {
    setSelectedClientIds((current) =>
      current.length === clients.length ? [] : clients.map((c) => c.id)
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setState({ status: "sending" });

    const url =
      channel === "email"
        ? "/api/professional/marketing/send-email"
        : "/api/professional/marketing/send-whatsapp";
    const body =
      channel === "email"
        ? { token, templateId, clientIds: selectedClientIds }
        : {
            token,
            templateId,
            phones: phones
              .split(/[\n,]/)
              .map((phone) => phone.trim())
              .filter(Boolean),
          };

    try {
      const response = await fetch(url, {
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
      setState({ status: "error", message: "Falha de rede ao enviar." });
    }
  }

  if (templates.length === 0) return null;

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-paper-alt/40 p-5">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setChannel("email")}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            channel === "email" ? "bg-primary text-paper" : "bg-paper text-ink-soft"
          }`}
        >
          Email
        </button>
        <button
          type="button"
          onClick={() => setChannel("whatsapp")}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            channel === "whatsapp" ? "bg-primary text-paper" : "bg-paper text-ink-soft"
          }`}
        >
          WhatsApp
        </button>
      </div>

      <label className="mt-4 block text-xs font-medium text-ink-soft">
        Modelo de mensagem
        <select
          value={templateId}
          onChange={(event) => setTemplateId(event.target.value)}
          className="mt-1 w-full rounded-xl border border-border bg-paper px-3 py-2 text-sm text-ink"
        >
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        {template && <p className="mt-1 text-xs text-ink-soft">{template.goal}</p>}
      </label>

      {template && (
        <div className="mt-3 rounded-xl border border-border bg-paper p-3 text-xs text-ink-soft">
          <p className="font-medium uppercase tracking-wide">Prévia</p>
          {channel === "email" ? (
            <p className="mt-1 text-ink">{template.email.subject}</p>
          ) : (
            <p className="mt-1 text-ink">{template.whatsapp}</p>
          )}
        </div>
      )}

      {channel === "email" ? (
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-ink-soft">Destinatários</p>
            {clients.length > 0 && (
              <button
                type="button"
                onClick={toggleAllClients}
                className="text-xs font-medium text-primary hover:underline"
              >
                {selectedClientIds.length === clients.length ? "Desmarcar todos" : "Selecionar todos"}
              </button>
            )}
          </div>
          {clients.length === 0 ? (
            <p className="mt-2 text-sm text-ink-soft">
              Você ainda não tem clientes cadastrados pra mandar campanha de email.
            </p>
          ) : (
            <div className="mt-2 max-h-48 space-y-1 overflow-y-auto rounded-xl border border-border bg-paper p-2">
              {clients.map((client) => (
                <label
                  key={client.id}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-ink hover:bg-paper-alt/60"
                >
                  <input
                    type="checkbox"
                    checked={selectedClientIds.includes(client.id)}
                    onChange={() => toggleClient(client.id)}
                  />
                  {client.full_name}{" "}
                  <span className="text-xs text-ink-soft">({client.email})</span>
                </label>
              ))}
            </div>
          )}
        </div>
      ) : (
        <label className="mt-4 block text-xs font-medium text-ink-soft">
          Números de WhatsApp de quem já autorizou receber mensagem (um por linha ou vírgula)
          <textarea
            value={phones}
            onChange={(event) => setPhones(event.target.value)}
            rows={3}
            placeholder="5511999999999, 5511988888888"
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
      {state.status === "error" && <p className="mt-3 text-xs text-red-600">{state.message}</p>}
    </form>
  );
}
