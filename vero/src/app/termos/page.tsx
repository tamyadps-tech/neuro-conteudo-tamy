import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { renderLegalDoc } from "@/lib/markdown";

export const metadata: Metadata = {
  title: "Termo de Uso — Vero",
};

export default async function TermosPage() {
  const html = await renderLegalDoc("termo-de-uso.md");

  return (
    <>
      <Header />
      <main className="flex-1">
        <article
          className="prose prose-neutral mx-auto max-w-3xl px-6 py-16 prose-headings:text-ink prose-a:text-primary"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </main>
      <Footer />
    </>
  );
}
