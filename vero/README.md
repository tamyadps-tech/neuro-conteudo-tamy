# Vero

Marketplace de terapeutas, psicólogos, coaches, consultores, mentores e
palestrantes — com vetting de credenciais, avaliações públicas e progresso
visual sem login. Ver [`BRANDING.md`](./BRANDING.md) para nome, cores e
tom de voz, e [`docs/planning/`](./docs/planning) para o PRD original.

**Estágio atual**: pré-lançamento. A landing page captura interesse de
clientes e profissionais numa lista de espera; o marketplace completo
(agenda, prontuário, pagamento) ainda não foi construído.

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

Para a lista de espera funcionar de verdade (gravar no banco em vez de
retornar 503), copie `.env.example` para `.env.local` e preencha
`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` de um projeto Supabase com a
migration `0001_waitlist.sql` aplicada.

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
  app/            # rotas (landing, /termos, /privacidade, /api/waitlist)
  components/     # componentes de UI da landing page
  lib/            # markdown renderer, cliente Supabase (server-only)
docs/
  legal/          # Termo de Uso e Política de Privacidade (fonte .md)
  email-templates/ # template de resumo de sessão com a marca Vero
  planning/       # PRD original (sumário executivo, resumo do projeto)
supabase/
  migrations/     # schema SQL: waitlist + entidades do marketplace
e2e/              # testes Playwright
```

## Próximos passos

1. **Revisão jurídica**: os documentos em `docs/legal/` têm campos
   `[a definir]` (razão social, CNPJ, telefone) e precisam de revisão por
   advogado especializado em LGPD antes de publicar de verdade.
2. **Provisionar Supabase**: criar o projeto real e aplicar as migrations
   em `supabase/migrations/` (isso tem passo de aprovação separado, por
   envolver criar um recurso de conta — perguntar antes de criar).
3. **Domínio**: registrar `vero.app` ou equivalente e configurar deploy
   (Vercel free tier é suficiente nesta fase).
4. Construir o marketplace em si: cadastro/vetting de profissionais,
   agenda, prontuário compartilhado, e o fluxo de progresso sem login.
