import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { AvailabilityManager } from "@/components/admin/AvailabilityManager";
import { SessionRow } from "@/components/admin/SessionRow";
import { CATEGORY_LABELS } from "@/lib/professional-categories";
import { SESSION_FORMAT_LABELS } from "@/lib/session-format";
import { getProfessional } from "@/lib/admin-professionals";
import { listAvailabilitySlots } from "@/lib/booking";
import { listSessionsForProfessional } from "@/lib/admin-sessions";

export default async function AdminProfessionalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lookup = await getProfessional(id);

  if (!lookup.configured) {
    return (
      <>
        <AdminNav active="/admin/profissionais" />
        <main className="mx-auto max-w-3xl px-6 py-10">
          <p className="font-medium text-ink">Supabase ainda não está configurado.</p>
        </main>
      </>
    );
  }

  if (!lookup.professional) {
    notFound();
  }

  const professional = lookup.professional;
  const slots = await listAvailabilitySlots(id);
  const sessions = await listSessionsForProfessional(id);

  return (
    <>
      <AdminNav active="/admin/profissionais" />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          {professional.full_name}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          {CATEGORY_LABELS[professional.category]} · {professional.email} ·{" "}
          {SESSION_FORMAT_LABELS[professional.session_format]}
        </p>

        {professional.vetting_status === "aprovado" && (
          <div className="mt-4 rounded-xl border border-border bg-paper-alt/40 px-4 py-3 text-sm">
            <p className="text-ink-soft">
              Painel próprio do profissional (agenda, prontuário, clientes e
              financeiro):{" "}
              <code className="text-ink">/p/{professional.access_token}</code>
            </p>
          </div>
        )}

        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
            Disponibilidade semanal
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            O profissional aprovado já gerencia isso pelo próprio painel
            (link acima). O que estiver aqui é só pra referência/suporte da
            equipe.
          </p>
          <div className="mt-4 rounded-2xl border border-border bg-paper-alt/40 p-5">
            {slots === null ? (
              <p className="text-sm text-ink-soft">
                Supabase ainda não está configurado.
              </p>
            ) : (
              <AvailabilityManager professionalId={id} slots={slots} />
            )}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
            Sessões e prontuário
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            O profissional aprovado já registra tópicos, tarefa e próxima
            sessão pelo próprio painel. O cliente vê isso no link de
            progresso dele.
          </p>
          <div className="mt-4 space-y-3">
            {sessions === null ? (
              <p className="text-sm text-ink-soft">
                Supabase ainda não está configurado.
              </p>
            ) : sessions.length === 0 ? (
              <p className="text-sm text-ink-soft">Nenhuma sessão ainda.</p>
            ) : (
              sessions.map((session) => (
                <SessionRow key={session.id} session={session} />
              ))
            )}
          </div>
        </section>
      </main>
    </>
  );
}
