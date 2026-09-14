"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WEEKDAY_LABELS } from "@/lib/availability";
import type { AdminAvailabilitySlot } from "@/lib/booking";

export function AvailabilityManager({
  professionalId,
  slots,
  token,
}: {
  professionalId: string;
  slots: AdminAvailabilitySlot[];
  /** Presente no painel do profissional (/p/[token]); ausente no admin. */
  token?: string;
}) {
  const router = useRouter();
  const [weekday, setWeekday] = useState("1");
  const [startTime, setStartTime] = useState("09:00");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function addSlot() {
    setPending(true);
    setError("");
    try {
      const response = token
        ? await fetch(`/api/professional/availability`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, weekday: Number(weekday), startTime }),
          })
        : await fetch(`/api/admin/professionals/${professionalId}/availability`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ weekday: Number(weekday), startTime }),
          });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Não foi possível salvar agora.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setPending(false);
    }
  }

  async function removeSlot(slotId: string) {
    setPending(true);
    setError("");
    try {
      const response = token
        ? await fetch(`/api/professional/availability/${slotId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          })
        : await fetch(
            `/api/admin/professionals/${professionalId}/availability/${slotId}`,
            { method: "DELETE" }
          );
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Não foi possível remover agora.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink" htmlFor="slot-weekday">
            Dia da semana
          </label>
          <select
            id="slot-weekday"
            value={weekday}
            onChange={(event) => setWeekday(event.target.value)}
            className="rounded-xl border border-border bg-paper px-3 py-2 text-sm text-ink"
          >
            {WEEKDAY_LABELS.map((label, index) => (
              <option key={label} value={index}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink" htmlFor="slot-time">
            Horário
          </label>
          <input
            id="slot-time"
            type="time"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
            className="rounded-xl border border-border bg-paper px-3 py-2 text-sm text-ink"
          />
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={addSlot}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-paper transition hover:bg-primary-dark disabled:opacity-60"
        >
          Adicionar horário
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-sm text-accent-dark">
          {error}
        </p>
      )}

      <ul className="mt-5 space-y-2">
        {slots.length === 0 && (
          <li className="text-sm text-ink-soft">Nenhum horário cadastrado ainda.</li>
        )}
        {slots.map((slot) => (
          <li
            key={slot.id}
            className="flex items-center justify-between rounded-xl border border-border bg-paper px-4 py-2.5 text-sm"
          >
            <span className="text-ink">
              {WEEKDAY_LABELS[slot.weekday]} · {slot.start_time.slice(0, 5)}
            </span>
            <button
              type="button"
              disabled={pending}
              onClick={() => removeSlot(slot.id)}
              className="text-xs font-medium text-ink-soft hover:text-accent-dark disabled:opacity-60"
            >
              Remover
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
