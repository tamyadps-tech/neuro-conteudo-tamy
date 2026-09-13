import { AdminNav } from "@/components/admin/AdminNav";
import { MetricCard } from "@/components/admin/MetricCard";
import { getAdminMetrics } from "@/lib/admin-metrics";
import { CATEGORY_LABELS } from "@/lib/professional-categories";

export default async function AdminOverviewPage() {
  const metrics = await getAdminMetrics();

  return (
    <>
      <AdminNav active="/admin" />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Visão geral
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Métricas em tempo real da Vero. Assinaturas e receita entram aqui
          assim que o Stripe estiver integrado.
        </p>

        {!metrics ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-paper-alt/40 p-8 text-center">
            <p className="font-medium text-ink">
              Supabase ainda não está configurado.
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              Defina <code>SUPABASE_URL</code> e{" "}
              <code>SUPABASE_SERVICE_ROLE_KEY</code> para ver métricas reais
              aqui.
            </p>
          </div>
        ) : (
          <>
            <section className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
                Lista de espera
              </h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-3">
                <MetricCard label="Total" value={metrics.waitlist.total} />
                <MetricCard label="Clientes" value={metrics.waitlist.clientes} />
                <MetricCard
                  label="Profissionais"
                  value={metrics.waitlist.profissionais}
                />
              </div>
            </section>

            <section className="mt-10">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
                Profissionais (vetting)
              </h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-4">
                <MetricCard label="Total" value={metrics.professionals.total} />
                <MetricCard
                  label="Pendentes"
                  value={metrics.professionals.pendente}
                  hint="Aguardando revisão"
                />
                <MetricCard
                  label="Aprovados"
                  value={metrics.professionals.aprovado}
                />
                <MetricCard
                  label="Rejeitados"
                  value={metrics.professionals.rejeitado}
                />
              </div>
              {Object.keys(metrics.professionals.byCategory).length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {Object.entries(metrics.professionals.byCategory).map(
                    ([category, count]) => (
                      <span
                        key={category}
                        className="rounded-full border border-border bg-paper px-3 py-1 text-xs text-ink-soft"
                      >
                        {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}:{" "}
                        <strong className="text-ink">{count}</strong>
                      </span>
                    )
                  )}
                </div>
              )}
            </section>

            <section className="mt-10">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
                Sessões
              </h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <MetricCard label="Agendadas" value={metrics.sessions.agendadas} />
                <MetricCard label="Concluídas" value={metrics.sessions.concluidas} />
              </div>
            </section>

            <section className="mt-10">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
                Assinaturas &amp; receita
              </h2>
              <div className="mt-3 rounded-2xl border border-dashed border-border bg-paper-alt/40 p-6 text-sm text-ink-soft">
                Ainda não existe cobrança implementada (Stripe). Esta seção
                vai mostrar MRR, comissão por sessão e assinaturas SaaS ativas
                assim que essa parte for construída.
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}
