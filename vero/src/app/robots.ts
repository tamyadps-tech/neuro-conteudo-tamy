import type { MetadataRoute } from "next";

// Pré-lançamento: bloqueia todos os buscadores enquanto o site está no ar
// só pra revisão interna. Trocar por regras reais (allow +
// sitemap) quando decidirem lançar de verdade.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
