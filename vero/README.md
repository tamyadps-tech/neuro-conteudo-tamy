# Vero

Marketplace de terapeutas, psicólogos, coaches, consultores, mentores e
palestrantes — com vetting de credenciais, avaliações públicas e progresso
visual sem login. Ver [`BRANDING.md`](./BRANDING.md) para nome, cores e
tom de voz, e [`docs/planning/`](./docs/planning) para o PRD original.

**Estágio atual**: pré-lançamento, ainda não está no ar. A landing page
captura interesse na lista de espera, e já existe o fluxo de cadastro e
vetting de profissional (formulário público + painel admin). Agenda,
prontuário compartilhado e pagamento ainda não foram construídos.

## Stack

Abordagem **híbrida**, escolhida para manter custo próximo de zero
enquanto o projeto valida demanda:

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS v4** — código
  próprio para o núcleo do produto (marketplace, perfis, dashboard)
- **Supabase** (Postgres) para dados — schema em [`supabase/migrations`](./supabase/migrations),
  ainda não aplicado a um projeto real (ver "Próximos passos")
- Serviços prontos só onde é essencial e barato: Stripe para pagamento e um
  provedor de email transacional, quando essas features forem construídas

## Rodando localmente

```bash
npm install
npm run dev
```

Abre em [http://localhost:3000](http://localhost:3000).

Copie `.env.example` para `.env.local` e preencha:

- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — de um projeto Supabase com
  as migrations de `supabase/migrations/` aplicadas. Sem isso, a lista de
  espera e o cadastro de profissional respondem 503 em vez de gravar.
- `ADMIN_USER` / `ADMIN_PASSWORD` — credenciais de HTTP Basic Auth pra
  acessar `/admin` (visão geral, fila de vetting). Sem isso, `/admin`
  responde 503. É proteção mínima pra "só vocês dois" — trocar por login de
  verdade (Supabase Auth) antes de dar acesso a mais gente.

## Testes

```bash
npm run test       # unitários (Vitest + Testing Library)
npm run test:watch # unitários em watch mode
npm run test:e2e   # smoke test end-to-end (Playwright)
npm run build      # build de produção + checagem de tipos
```

## Estrutura

```
src/
  app/
    (landing, /termos, /privacidade)
    profissionais/cadastro/  # formulário público de candidatura
    admin/                   # visão geral (BI), fila de vetting, assinaturas (placeholder)
    api/
      waitlist/               # POST lista de espera
      professionals/apply/    # POST candidatura de profissional
      admin/professionals/[id]/ # PATCH aprovar/rejeitar (protegido pelo proxy)
  components/       # UI da landing page + admin/ (painel)
  lib/              # markdown renderer, cliente Supabase (server-only),
                     # métricas de BI, categorias/formatos compartilhados
  proxy.ts          # HTTP Basic Auth em /admin e /api/admin (Next 16 "proxy")
docs/
  legal/          # Termo de Uso e Política de Privacidade (fonte .md)
  email-templates/ # template de resumo de sessão com a marca Vero
  planning/       # PRD original (sumário executivo, resumo do projeto)
supabase/
  migrations/     # schema SQL: waitlist + entidades do marketplace
e2e/              # testes Playwright
```

## O que já dá pra fazer

- Visitante entra na lista de espera (cliente ou profissional)
- Profissional se candidata em `/profissionais/cadastro`, informando
  categoria, anos de experiência, especialidades, métodos/abordagens,
  estilo de atendimento e formato (online/presencial/híbrido, com
  cidade/estado quando há ponto físico)
- Vocês dois revisam candidaturas em `/admin/profissionais` e
  aprovam/rejeitam
- `/admin` mostra métricas (lista de espera, profissionais por status e
  categoria) — a base do painel de BI. Assinaturas fica como placeholder
  até existir cobrança (Stripe)

Tudo isso funciona sem quebrar mesmo sem Supabase configurado: as rotas
respondem 503 com uma mensagem clara em vez de dar erro.

## Próximos passos

1. **Revisão jurídica**: os documentos em `docs/legal/` têm campos
   `[a definir]` (razão social, CNPJ, telefone) e precisam de revisão por
   advogado especializado em LGPD antes de publicar de verdade.
2. **Provisionar Supabase**: criar o projeto real e aplicar as migrations
   em `supabase/migrations/` (isso tem passo de aprovação separado, por
   envolver criar um recurso de conta — perguntar antes de criar).
3. **Login de verdade no admin**: trocar o Basic Auth por Supabase Auth
   assim que mais de vocês dois precisar de acesso.
4. **Domínio e deploy**: registrar domínio e colocar no ar — combinado que
   isso só acontece depois que o produto estiver mais construído.
5. Continuar o marketplace: perfil público do profissional + busca, agenda,
   prontuário compartilhado, progresso sem login, e cobrança (Stripe) —
   isso também destrava a seção "Assinaturas" do admin.
