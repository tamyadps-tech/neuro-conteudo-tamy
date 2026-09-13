import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProfessionalApplyForm } from "@/components/ProfessionalApplyForm";

export const metadata: Metadata = {
  title: "Cadastro de profissional — Vero",
  description:
    "Candidate-se para entrar na Vero. Toda candidatura passa por verificação de credenciais antes da aprovação.",
};

export default function CadastroProfissionalPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-2xl px-6 py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-paper-alt px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-ink-soft">
            Cadastro de profissional
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Candidate-se para a Vero
          </h1>
          <p className="mt-3 text-ink-soft">
            Toda candidatura passa por verificação de credenciais (CRP,
            certificações, diplomas) antes de entrar no marketplace. Avisamos
            o resultado por email em até 7 dias úteis. Ao enviar, você
            concorda com o{" "}
            <a href="/termos" className="text-primary hover:underline">
              Termo de Uso
            </a>
            .
          </p>

          <div className="mt-10 rounded-2xl border border-border bg-paper-alt/40 p-6 sm:p-8">
            <ProfessionalApplyForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
