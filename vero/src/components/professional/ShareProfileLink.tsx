"use client";

import { useState } from "react";

export function ShareProfileLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API pode falhar (permissão, navegador antigo) — o link
      // continua visível no campo pra copiar manualmente.
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        readOnly
        value={url}
        onFocus={(event) => event.currentTarget.select()}
        className="min-w-0 flex-1 rounded-xl border border-border bg-paper px-3 py-2 text-sm text-ink-soft"
      />
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-paper transition hover:bg-primary-dark"
      >
        {copied ? "Copiado!" : "Copiar link"}
      </button>
    </div>
  );
}
