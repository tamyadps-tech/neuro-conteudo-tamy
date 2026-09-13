import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <Logo />
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
          <Link href="/termos" className="hover:text-ink">
            Termo de Uso
          </Link>
          <Link href="/privacidade" className="hover:text-ink">
            Privacidade
          </Link>
          <a href="mailto:contato@vero.app" className="hover:text-ink">
            contato@vero.app
          </a>
        </nav>
        <p className="text-xs text-ink-soft">
          © {new Date().getFullYear()} Vero. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
