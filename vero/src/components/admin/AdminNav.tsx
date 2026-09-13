import Link from "next/link";
import { Logo } from "@/components/Logo";

const links = [
  { href: "/admin", label: "Visão geral" },
  { href: "/admin/profissionais", label: "Profissionais" },
  { href: "/admin/assinaturas", label: "Assinaturas" },
];

export function AdminNav({ active }: { active: string }) {
  return (
    <header className="border-b border-border/70 bg-paper-alt/40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="rounded-full bg-ink px-2.5 py-1 text-xs font-semibold text-paper">
            Admin
          </span>
        </div>
        <nav className="flex items-center gap-6 text-sm font-medium text-ink-soft">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                active === link.href
                  ? "text-ink"
                  : "hover:text-ink"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
