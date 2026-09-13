"use client";

import { useState, type FormEvent } from "react";

type Status = "picking" | "form" | "loading" | "success" | "error";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "short",
  day: "2-digit",
  month: "short",
});
const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

export function BookingWidget({
  professionalId,
  slotsIso,
}: {
  professionalId: string;
  slotsIso: string[];
}) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("picking");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedSlot) return;
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/sessions/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professionalId,
          slot: selectedSlot,
          clientName: name,
          clientEmail: email,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível agendar agora.");
      }

      setStatus("success");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível agendar agora. Tente novamente."
      );
    }
  }

  if (slotsIso.length === 0) {
    return (
      <p className="text-sm text-ink-soft">
        Sem horários disponíveis no momento. Volte em breve.
      </p>
    );
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-primary/30 bg-primary-light px-6 py-5 text-center">
        <p className="font-medium text-primary-dark">
          Sessão agendada! Você vai receber um email de confirmação.
        </p>
      </div>
    );
  }

  if (status === "form" || status === "loading" || status === "error") {
    const slotDate = selectedSlot ? new Date(selectedSlot) : null;
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {slotDate && (
          <p className="text-sm text-ink">
            Agendando para{" "}
            <strong>
              {dateFormatter.format(slotDate)} às {timeFormatter.format(slotDate)}
            </strong>
            .{" "}
            <button
              type="button"
              onClick={() => setStatus("picking")}
              className="text-primary hover:underline"
            >
              Trocar horário
            </button>
          </p>
        )}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink" htmlFor="booking-name">
            Nome completo
          </label>
          <input
            id="booking-name"
            required
            minLength={3}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-xl border border-border bg-paper px-4 py-2.5 text-sm text-ink focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink" htmlFor="booking-email">
            Email
          </label>
          <input
            id="booking-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-border bg-paper px-4 py-2.5 text-sm text-ink focus:border-primary focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-paper transition hover:bg-primary-dark disabled:opacity-60"
        >
          {status === "loading" ? "Agendando…" : "Confirmar agendamento"}
        </button>
        {status === "error" && (
          <p role="alert" className="text-sm text-accent-dark">
            {message}
          </p>
        )}
      </form>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {slotsIso.map((iso) => {
        const date = new Date(iso);
        return (
          <button
            key={iso}
            type="button"
            onClick={() => {
              setSelectedSlot(iso);
              setStatus("form");
            }}
            className="rounded-xl border border-border bg-paper px-4 py-2.5 text-left text-sm text-ink transition hover:border-primary"
          >
            {dateFormatter.format(date)} · {timeFormatter.format(date)}
          </button>
        );
      })}
    </div>
  );
}
