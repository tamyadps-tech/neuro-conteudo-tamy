"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { parseTagList } from "@/lib/tags";
import type { AdminSession, SessionStatus } from "@/lib/admin-sessions";

const STATUS_LABELS: Record<SessionStatus, string> = {
  agendada: "Agendada",
  concluida: "Concluída",
  cancelada_cliente: "Cancelada (cliente)",
  cancelada_profissional: "Cancelada (profissional)",
};

const PAYMENT_LABELS: Record<string, string> = {
  pendente: "Pagamento pendente",
  pago: "Pago",
  falhou: "Pagamento falhou",
  reembolsado: "Reembolsado",
};

const PAYMENT_STYLES: Record<string, string> = {
  pendente: "bg-accent-light text-accent-dark",
  pago: "bg-primary-light text-primary-dark",
  falhou: "bg-paper-alt text-ink-soft",
  reembolsado: "bg-paper-alt text-ink-soft",
};

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

/** "2026-06-17T14:00" pro valor de um <input type="datetime-local">. */
function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function SessionRow({ session }: { session: AdminSession }) {
  const router = useRouter();
  const [topics, setTopics] = useState(session.topics?.join(", ") ?? "");
  const [homework, setHomework] = useState(session.homework ?? "");
  const [nextSessionAt, setNextSessionAt] = useState(
    toDatetimeLocal(session.next_session_at)
  );
  const [status, setStatus] = useState<SessionStatus>(session.status);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function save() {
    setPending(true);
    setError("");
    setSaved(false);
    try {
      const response = await fetch(`/api/admin/sessions/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topics: parseTagList(topics),
          homework,
          nextSessionAt: nextSessionAt ? new Date(nextSessionAt).toISOString() : null,
          status,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Não foi possível salvar agora.");
      }
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-paper p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-semibold text-ink">
            {session.client?.full_name ?? "Cliente removido"}
          </p>
          <p className="text-xs text-ink-soft">
            {session.client?.email} · {dateFormatter.format(new Date(session.scheduled_at))}
          </p>
          {session.payment && (
            <span
              className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs ${PAYMENT_STYLES[session.payment.status]}`}
            >
              {PAYMENT_LABELS[session.payment.status]} ·{" "}
              {formatPrice(session.payment.amount_cents)}
            </span>
          )}
        </div>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as SessionStatus)}
          className="rounded-lg border border-border bg-paper px-2.5 py-1.5 text-xs text-ink"
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink">
            Tópicos abordados
          </label>
          <input
            value={topics}
            onChange={(event) => setTopics(event.target.value)}
            placeholder="Ansiedade, respiração, rotina de sono"
            className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-sm text-ink"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink">
            Tarefa até a próxima sessão
          </label>
          <textarea
            value={homework}
            onChange={(event) => setHomework(event.target.value)}
            rows={2}
            className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-sm text-ink"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink">
            Próxima sessão
          </label>
          <input
            type="datetime-local"
            value={nextSessionAt}
            onChange={(event) => setNextSessionAt(event.target.value)}
            className="rounded-lg border border-border bg-paper px-3 py-2 text-sm text-ink"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={save}
          className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-paper transition hover:bg-primary-dark disabled:opacity-60"
        >
          {pending ? "Salvando…" : "Salvar"}
        </button>
        {saved && <span className="text-xs text-primary-dark">Salvo!</span>}
        {error && (
          <span role="alert" className="text-xs text-accent-dark">
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
