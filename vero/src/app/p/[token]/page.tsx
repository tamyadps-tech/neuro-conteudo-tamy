import type { Metadata } from "next";
import { headers } from "next/headers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AvailabilityManager } from "@/components/admin/AvailabilityManager";
import { SessionRow } from "@/components/admin/SessionRow";
import { ShareProfileLink } from "@/components/professional/ShareProfileLink";
import { RatingBadge } from "@/components/RatingBadge";
import { getProfessionalByToken } from "@/lib/professional-auth";
import { listAvailabilitySlots } from "@/lib/booking";
import { listSessionsForProfessional } from "@/lib/admin-sessions";
import { listProfessionalClients } from "@/lib/professional-clients";
import { getProfessionalFinance } from "@/lib/professional-finance";
import { getReviewSummaries } from "@/lib/reviews";
import { CATEGORY_LABELS } from "@/lib/professional-categories";
import { SESSION_FORMAT_LABELS } from "@/lib/session-format";

export const metadata: Metadata = {
  title: "Meu painel — Vero",
  robots: { index: false, follow: false },
};

// Sem cache estático: cada visita precisa dos dados mais recentes do
// próprio profissional (agenda, sessões, financeiro).
export const dynamic = "force-dynamic";

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

function EmptyShell({ message, detail }: { message: string; detail?: string }) {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-6 py-20 text-center">
          <p className="font-medium text-ink">{message}</p>
          {detail && <p className="mt-1 text-sm text-ink-soft">{detail}</p>}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default async function ProfessionalDashboardPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const lookup = await getProfessionalByToken(token);

  if (!lookup.configured) {
    return <EmptyShell message="Essa área ainda não está disponível." />;
  }

  if (!lookup.professional) {
    return (
      <EmptyShell
        message="Link não encontrado."
        detail="Confira se copiou o link completo, ou fale com suporte@vero.app."
      />
    );
  }

  const professional = lookup.professional;

  if (professional.vetting_status === "pendente") {
    return (
      <EmptyShell
        message={`Olá, ${professional.full_name.split(" ")[0]}!`}
        detail="Sua candidatura ainda está em análise. Você recebe um email assim que aprovarmos seu perfil."
      />
    );
  }

  if (professional.vetting_status === "rejeitado") {
    return (
      <EmptyShell
        message={`Olá, ${professional.full_name.split(" ")[0]}.`}
        detail={
          professional.vetting_notes
            ? `Sua candidatura não foi aprovada nesta etapa. Observação da equipe: ${professional.vetting_notes}`
            : "Sua candidatura não foi aprovada nesta etapa. Dúvidas? Escreva pra suporte@vero.app."
        }
      />
    );
  }

  const [slots, sessions, clients, finance, reviewSummaries, headersList] = await Promise.all([
    listAvailabilitySlots(professional.id),
    listSessionsForProfessional(professional.id),
    listProfessionalClients(professional.id),
    getProfessionalFinance(professional.id),
    getReviewSummaries([professional.id]),
    headers(),
  ]);

  const origin = `${headersList.get("x-forwarded-proto") ?? "https"}://${headersList.get("host") ?? "vero.app"}`;
  const publicProfileUrl = `${origin}/profissionais/${professional.id}`;
  const rating = reviewSummaries?.[professional.id] ?? { average: 0, count: 0 };

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-paper-alt px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-ink-soft">
            Meu painel
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
            Olá, {professional.full_name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {CATEGORY_LABELS[professional.category]} · {SESSION_FORMAT_LABELS[professional.session_format]} ·{" "}
            {formatPrice(professional.price_cents)}/sessão · <RatingBadge average={rating.average} count={rating.count} />
          </p>

          {/* Divulgação */}
          <section className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
              Divulgação
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Esse é o link do seu perfil público na Vero. Compartilhe nas suas redes,
              WhatsApp ou bio do Instagram pra atrair novos clientes.
            </p>
            <div className="mt-4 rounded-2xl border border-border bg-paper-alt/40 p-5">
              <ShareProfileLink url={publicProfileUrl} />
            </div>
          </section>

          {/* Financeiro */}
          <section className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
              Financeiro
            </h2>
            {finance === null ? (
              <p className="mt-3 text-sm text-ink-soft">Supabase ainda não está configurado.</p>
            ) : (
              <>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-paper-alt/40 p-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                      Recebido
                    </p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">
                      {formatPrice(finance.receivedCents)}
                    </p>
                    <p className="mt-1 text-xs text-ink-soft">
                      {finance.paidSessionsCount} sessões pagas
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-paper-alt/40 p-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                      Pendente
                    </p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">
                      {formatPrice(finance.pendingCents)}
                    </p>
                    <p className="mt-1 text-xs text-ink-soft">Checkout iniciado, ainda não pago</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-ink-soft">
                  Sem Stripe Connect ainda: o valor cai na conta da Vero e o repasse é
                  manual, como descrito no Termo de Uso.
                </p>
                {finance.transactions.length > 0 && (
                  <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-paper-alt/60 text-xs uppercase tracking-wide text-ink-soft">
                        <tr>
                          <th className="px-4 py-2.5">Cliente</th>
                          <th className="px-4 py-2.5">Sessão</th>
                          <th className="px-4 py-2.5">Status</th>
                          <th className="px-4 py-2.5 text-right">Valor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {finance.transactions.slice(0, 20).map((tx) => (
                          <tr key={tx.sessionId}>
                            <td className="px-4 py-2.5 text-ink">{tx.clientName}</td>
                            <td className="px-4 py-2.5 text-ink-soft">
                              {dateFormatter.format(new Date(tx.scheduledAt))}
                            </td>
                            <td className="px-4 py-2.5 text-ink-soft">{tx.status}</td>
                            <td className="px-4 py-2.5 text-right text-ink">
                              {formatPrice(tx.amountCents)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </section>

          {/* CRM de clientes */}
          <section className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
              Meus clientes
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Quem já passou por sessões com você, com histórico e valor gerado.
            </p>
            <div className="mt-4">
              {clients === null ? (
                <p className="text-sm text-ink-soft">Supabase ainda não está configurado.</p>
              ) : clients.length === 0 ? (
                <p className="text-sm text-ink-soft">Nenhum cliente ainda.</p>
              ) : (
                <div className="space-y-2">
                  {clients.map((client) => (
                    <div
                      key={client.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-paper px-4 py-3 text-sm"
                    >
                      <div>
                        <p className="font-medium text-ink">{client.full_name}</p>
                        <p className="text-xs text-ink-soft">{client.email}</p>
                      </div>
                      <div className="text-right text-xs text-ink-soft">
                        <p>
                          {client.sessionCount} sessõe{client.sessionCount === 1 ? "" : "s"} ·{" "}
                          {formatPrice(client.totalPaidCents)} pago
                        </p>
                        {client.lastSessionAt && (
                          <p>Última: {dateFormatter.format(new Date(client.lastSessionAt))}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Disponibilidade */}
          <section className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
              Disponibilidade semanal
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Cada horário se repete toda semana até você removê-lo.
            </p>
            <div className="mt-4 rounded-2xl border border-border bg-paper-alt/40 p-5">
              {slots === null ? (
                <p className="text-sm text-ink-soft">Supabase ainda não está configurado.</p>
              ) : (
                <AvailabilityManager professionalId={professional.id} slots={slots} token={token} />
              )}
            </div>
          </section>

          {/* Sessões e prontuário */}
          <section className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
              Sessões e prontuário
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Registre tópicos, tarefa e a próxima sessão. O cliente vê isso no
              próprio link de progresso.
            </p>
            <div className="mt-4 space-y-3">
              {sessions === null ? (
                <p className="text-sm text-ink-soft">Supabase ainda não está configurado.</p>
              ) : sessions.length === 0 ? (
                <p className="text-sm text-ink-soft">Nenhuma sessão ainda.</p>
              ) : (
                sessions.map((session) => (
                  <SessionRow key={session.id} session={session} token={token} />
                ))
              )}
            </div>
          </section>
        </section>
      </main>
      <Footer />
    </>
  );
}
