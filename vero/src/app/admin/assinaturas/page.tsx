import { AdminNav } from "@/components/admin/AdminNav";

export default function AdminSubscriptionsPage() {
  return (
    <>
      <AdminNav active="/admin/assinaturas" />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Assinaturas
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Planos SaaS para profissionais (R$99–299/mês) e comissão por sessão.
        </p>

        <div className="mt-8 rounded-2xl border border-dashed border-border bg-paper-alt/40 p-8 text-center">
          <p className="font-medium text-ink">Ainda não construído.</p>
          <p className="mt-1 text-sm text-ink-soft">
            Esta tela vai listar assinaturas ativas, MRR e cobrança assim que
            o Stripe for integrado (ver PRD em{" "}
            <code>docs/planning/01-resumo-executivo-projeto.md</code>, seção
            &quot;Modelo de Receita&quot;).
          </p>
        </div>
      </main>
    </>
  );
}
