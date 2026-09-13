import Link from "next/link";
import { Logo } from "./Logo";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" aria-label="Vero — página inicial">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-ink-soft sm:flex">
          <a href="#como-funciona" className="hover:text-ink">
            Como funciona
          </a>
          <a href="#para-profissionais" className="hover:text-ink">
            Para profissionais
          </a>
          <a href="#confianca" className="hover:text-ink">
            Confiança &amp; vetting
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <a
            href="#lista-espera-profissional"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-ink-soft transition hover:text-ink sm:block"
          >
            Sou profissional
          </a>
          <a
            href="#lista-espera-cliente"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-primary-dark"
          >
            Entrar na lista de espera
          </a>
        </div>
      </div>
    </header>
  );
}
