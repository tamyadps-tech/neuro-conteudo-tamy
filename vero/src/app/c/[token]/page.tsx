import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getClientProgress } from "@/lib/client-progress";
import { ReviewForm } from "@/components/ReviewForm";

export const metadata: Metadata = {
  title: "Seu progresso — Vero",
  robots: { index: false, follow: false },
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
  timeStyle: "short",
});

const STATUS_LABELS: Record<string, string> = {
  agendada: "Agendada",
  concluida: "Concluída",
  cancelada_cliente: "Cancelada por você",
  cancelada_profissional: "Cancelada pelo profissional",
};

export default async function ClientProgressPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const lookup = await getClientProgress(token);

  if (!lookup.configured) {
    return (
      <>
        <Header />
        <main className="flex-1">
          <div className="mx-auto max-w-2xl px-6 py-20 text-center">
            <p className="font-medium text-ink">
              Essa área ainda não está disponível.
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!lookup.client) {
    return (
      <>
        <Header />
        <main className="flex-1">
          <div className="mx-auto max-w-2xl px-6 py-20 text-center">
            <p className="font-medium text-ink">Link não encontrado.</p>
            <p className="mt-1 text-sm text-ink-soft">
              Confira se copiou o link completo, ou fale com{" "}
              <a href="mailto:suporte@vero.app" className="text-primary hover:underline">
                suporte@vero.app
              </a>
              .
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const { client } = lookup;
  // eslint-disable-next-line react-hooks/purity -- Server Component: precisa do horário real do request pra separar passado/futuro.
  const now = Date.now();
  // client.sessions vem ordenado do mais recente pro mais antigo.
  const upcoming = client.sessions
    .filter((s) => s.status === "agendada" && new Date(s.scheduled_at).getTime() > now)
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  const nextSession = upcoming[0] ?? null;
  const past = client.sessions.filter((s) => s !== nextSession);

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-2xl px-6 py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-paper-alt px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-ink-soft">
            Seu progresso
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
            Olá, {client.full_name.split(" ")[0]}
          </h1>

          {nextSession && (
            <div className="mt-8 rounded-2xl border border-primary/30 bg-primary-light p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
                Próxima sessão
              </p>
              <p className="mt-1 text-lg font-semibold text-ink">
                {dateFormatter.format(new Date(nextSession.scheduled_at))}
              </p>
              {nextSession.professional && (
                <p className="text-sm text-ink-soft">
                  com {nextSession.professional.full_name}
                </p>
              )}
            </div>
          )}

          <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-ink-soft">
            Histórico de sessões
          </h2>

          {past.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">
              Nenhuma sessão registrada ainda.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {past.map((session) => (
                <div
                  key={session.id}
                  className="rounded-2xl border border-border bg-paper-alt/40 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-ink">
                      {dateFormatter.format(new Date(session.scheduled_at))}
                    </p>
                    <span className="rounded-full bg-paper px-2.5 py-0.5 text-xs text-ink-soft">
                      {STATUS_LABELS[session.status] ?? session.status}
                    </span>
                  </div>
                  {session.professional && (
                    <p className="text-sm text-ink-soft">
                      com {session.professional.full_name}
                    </p>
                  )}

                  {session.topics && session.topics.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                        Tópicos abordados
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {session.topics.map((topic) => (
                          <span
                            key={topic}
                            className="rounded-full bg-primary-light px-2.5 py-0.5 text-xs text-primary-dark"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {session.homework && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                        Tarefa
                      </p>
                      <p className="mt-1 text-sm text-ink">{session.homework}</p>
                    </div>
                  )}

                  {session.status === "concluida" &&
                    (session.review ? (
                      <p className="mt-3 text-sm text-ink-soft">
                        Sua avaliação:{" "}
                        <span className="text-accent">
                          {"★".repeat(session.review.rating)}
                          {"☆".repeat(5 - session.review.rating)}
                        </span>
                        {session.review.comment && ` — "${session.review.comment}"`}
                      </p>
                    ) : (
                      <ReviewForm token={token} sessionId={session.id} />
                    ))}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
