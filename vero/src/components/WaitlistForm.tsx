"use client";

import { useState, type FormEvent } from "react";

type Role = "cliente" | "profissional";
type Status = "idle" | "loading" | "success" | "error";

export function WaitlistForm({
  defaultRole = "cliente",
}: {
  defaultRole?: Role;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>(defaultRole);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível enviar agora.");
      }

      setStatus("success");
      setMessage("Pronto! Você está na lista. Avisaremos por email.");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar agora. Tente novamente."
      );
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-primary/30 bg-primary-light px-6 py-5 text-center">
        <p className="font-medium text-primary-dark">{message}</p>
      </div>
    );
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 rounded-2xl border border-border bg-paper-alt/60 p-2 sm:flex-row"
      >
        <label className="sr-only" htmlFor="waitlist-email">
          Seu email
        </label>
        <input
          id="waitlist-email"
          type="email"
          required
          placeholder="seu@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="flex-1 rounded-xl border border-transparent bg-paper px-4 py-3 text-sm text-ink placeholder:text-ink-soft/70 focus:border-primary focus:outline-none"
        />
        <div className="flex gap-2">
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as Role)}
            aria-label="Você é cliente ou profissional?"
            className="rounded-xl border border-transparent bg-paper px-3 py-3 text-sm text-ink focus:border-primary focus:outline-none"
          >
            <option value="cliente">Sou cliente</option>
            <option value="profissional">Sou profissional</option>
          </select>
          <button
            type="submit"
            disabled={status === "loading"}
            className="whitespace-nowrap rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-paper transition hover:bg-accent-dark disabled:opacity-60"
          >
            {status === "loading" ? "Enviando…" : "Entrar na lista"}
          </button>
        </div>
      </form>
      {status === "error" && (
        <p role="alert" className="mt-2 text-center text-sm text-accent-dark">
          {message}
        </p>
      )}
    </div>
  );
}
