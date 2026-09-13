"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function ReviewForm({
  token,
  sessionId,
}: {
  token: string;
  sessionId: string;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (rating === 0) {
      setStatus("error");
      setMessage("Escolha uma nota de 1 a 5.");
      return;
    }
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, sessionId, rating, comment }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível enviar agora.");
      }

      setStatus("success");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Não foi possível enviar agora."
      );
    }
  }

  if (status === "success") {
    return (
      <p className="mt-3 text-sm font-medium text-primary-dark">
        Obrigado pela avaliação!
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 rounded-xl bg-paper p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
        Como foi essa sessão?
      </p>
      <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Nota de 1 a 5">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={rating === value}
            aria-label={`${value} estrela${value > 1 ? "s" : ""}`}
            onClick={() => setRating(value)}
            className={`text-2xl leading-none ${value <= rating ? "text-accent" : "text-border"}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Comentário opcional"
        rows={2}
        maxLength={500}
        className="mt-2 w-full rounded-lg border border-border bg-paper px-3 py-2 text-sm text-ink"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-2 rounded-lg bg-accent px-4 py-1.5 text-xs font-semibold text-paper transition hover:bg-accent-dark disabled:opacity-60"
      >
        {status === "loading" ? "Enviando…" : "Enviar avaliação"}
      </button>
      {status === "error" && (
        <p role="alert" className="mt-2 text-xs text-accent-dark">
          {message}
        </p>
      )}
    </form>
  );
}
