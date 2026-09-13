import { NextResponse, type NextRequest } from "next/server";

/**
 * Proteção mínima do /admin enquanto não existe um sistema de login de
 * verdade (Supabase Auth). HTTP Basic Auth com credenciais em variáveis de
 * ambiente — suficiente para "só eu e minha equipe" nesta fase, mas troque
 * por um login real antes de dar acesso a mais gente.
 */
export function proxy(request: NextRequest) {
  const user = process.env.ADMIN_USER;
  const password = process.env.ADMIN_PASSWORD;

  if (!user || !password) {
    return new NextResponse(
      "Admin não configurado: defina ADMIN_USER e ADMIN_PASSWORD.",
      { status: 503 }
    );
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Basic ")) {
    const decoded = atob(authHeader.slice(6));
    const separatorIndex = decoded.indexOf(":");
    const suppliedUser = decoded.slice(0, separatorIndex);
    const suppliedPassword = decoded.slice(separatorIndex + 1);
    if (suppliedUser === user && suppliedPassword === password) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Autenticação necessária.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Vero Admin"' },
  });
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
