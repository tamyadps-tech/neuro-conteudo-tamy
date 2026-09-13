# Vero — Guia de Marca

## O nome

**Vero**, do latim *verus* (verdadeiro). Curto, fácil de falar em português e
inglês, e carrega o diferencial central do produto: profissionais
**verificados** e progresso que **se vê**, não algo que se promete. Também
soa natural em domínios (`vero.app`), redes sociais e como nome de empresa.

**Tagline**: *Profissionais verificados. Progresso que se vê.*

**Tom de voz**: direto, acolhedor, sem jargão clínico. Fala com quem busca
ajuda séria (cliente) e com quem presta esse serviço (profissional) — nunca
com linguagem de "growth hacker" nem excesso de formalidade jurídica fora
dos documentos legais.

---

## Paleta de cores

Fugimos do roxo-gradiente genérico de SaaS. A Vero usa um verde-petróleo
(confiança, saúde, calma) combinado com terracota quente (humanidade,
acolhimento) sobre um fundo creme — soa profissional sem ser fria.

| Token | Hex | Uso |
|---|---|---|
| `--color-primary` | `#0F6E64` | Ações primárias, links, ícones de destaque, texto de marca |
| `--color-primary-dark` | `#0A4F48` | Hover/active de botões primários |
| `--color-primary-light` | `#E4F2EF` | Fundos suaves (badges, cards de destaque) |
| `--color-accent` | `#E9673F` | CTA secundário (ex. "Entrar na lista"), alertas de atenção |
| `--color-accent-dark` | `#C94E29` | Hover do accent |
| `--color-accent-light` | `#FDECE4` | Fundos suaves com accent |
| `--color-paper` | `#FBF8F3` | Fundo principal (creme quente, não branco puro) |
| `--color-paper-alt` | `#F3EEE4` | Fundo de seções alternadas, cards |
| `--color-ink` | `#1B2421` | Texto principal |
| `--color-ink-soft` | `#5B6763` | Texto secundário, legendas |
| `--color-border` | `#E4DCCC` | Bordas e divisores |

Definidos como CSS custom properties em `src/app/globals.css` e expostos ao
Tailwind via `@theme inline` — usar como `bg-primary`, `text-ink-soft`,
`border-border`, etc.

**Regra de contraste**: texto sobre `primary`/`accent` é sempre `paper`
(branco-creme), nunca preto puro. Texto de corpo é sempre `ink` ou
`ink-soft` sobre `paper`/`paper-alt`, nunca cor pura da marca (falha de
acessibilidade e de legibilidade).

---

## Tipografia

Pilha de fontes do sistema (`-apple-system, "Segoe UI", Roboto, Helvetica,
Arial, sans-serif`) — zero custo de licença, zero dependência de rede no
build, carregamento instantâneo. Quando o orçamento permitir, a próxima
melhoria é trocar por uma fonte de marca (ex. via `next/font/google` com
self-hosting automático), mas isso é otimização, não bloqueio.

Hierarquia:
- **H1** (hero): `text-4xl`/`text-5xl`, `font-semibold`, `tracking-tight`
- **H2** (seção): `text-3xl`, `font-semibold`, `tracking-tight`
- **H3** (card): `text-lg`, `font-semibold`
- **Corpo**: `text-base`/`text-sm`, `leading-relaxed`, cor `ink-soft`

---

## Logo

`src/components/Logo.tsx` (wordmark completo) e `src/app/icon.svg`
(favicon/ícone). O símbolo é um "V" estilizado dentro de um quadrado
arredondado na cor primária, com um ponto terracota no canto — lembra um
ícone de "verificado" (check/seal) sem copiar literalmente um selo de
verificação de rede social.

**Uso**:
- Sempre com espaçamento mínimo equivalente à altura do ícone ao redor
- Nunca esticar, rotacionar ou recolorir fora da paleta acima
- Em fundos escuros (ainda não definidos formalmente): usar a versão com
  `--color-paper` como fundo do ícone, mantendo o "V" em `--color-primary`
  invertido — a definir quando houver necessidade real de dark mode

---

## Próximos passos de marca (quando o orçamento permitir)

1. Fonte de marca própria (headline diferenciada do corpo)
2. Ilustrações/fotografia de estilo consistente para perfis de profissionais
3. Variação do logo para redes sociais (avatar quadrado) e para o email
   transacional (ver `docs/legal` e o template de email original em
   `4-EMAIL_TEMPLATE_RESUMO_SESSAO.html`, que precisa ser migrado para as
   cores acima antes de ir para produção)
4. Modo escuro, se a base de usuários pedir
