import type { MarketingPlatform, MarketingIntegrationStatus } from "@/lib/marketing-integrations";

export function MarketingPlatformList({
  platforms,
  status,
  envVarsHint,
}: {
  platforms: MarketingPlatform[];
  status: MarketingIntegrationStatus;
  envVarsHint: string;
}) {
  return (
    <div>
      <div
        className={`flex items-center gap-2 rounded-xl border p-3 text-sm ${
          status.configured
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-dashed border-border bg-paper-alt/40 text-ink-soft"
        }`}
      >
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${status.configured ? "bg-emerald-500" : "bg-ink-soft/40"}`}
        />
        {status.configured ? (
          <span>Conectado — pronto pra disparar campanhas de verdade.</span>
        ) : (
          <span>
            Ainda não conectado. Defina <code>{envVarsHint}</code> pra ligar o envio real
            (sem isso, a campanha só mostra o resultado como &quot;não enviado&quot;).
          </span>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {platforms.map((platform) => (
          <div
            key={platform.id}
            className={`rounded-2xl border p-4 ${
              platform.recommended ? "border-primary bg-primary/5" : "border-border bg-paper"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-ink">{platform.name}</h4>
              {platform.recommended && (
                <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-paper">
                  Recomendada
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-ink-soft">{platform.summary}</p>
            <p className="mt-2 text-xs leading-relaxed text-ink-soft">{platform.why}</p>
            <a
              href={platform.url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-xs font-medium text-primary hover:underline"
            >
              Conhecer {platform.name} →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
