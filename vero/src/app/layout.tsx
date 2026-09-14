import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vero — Profissionais verificados. Progresso que se vê.",
  description:
    "Marketplace de terapeutas, psicólogos, coaches e consultores com vetting de credenciais, avaliações públicas e progresso visual sem login.",
  // Pré-lançamento: o site está no ar pra revisão interna, mas ainda não
  // é pra aparecer em buscadores. Remover quando decidirem lançar de
  // verdade (ver robots.ts também).
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-paper text-ink">
        {children}
      </body>
    </html>
  );
}
