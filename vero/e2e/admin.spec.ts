import { test, expect } from "@playwright/test";

test("admin area requires authentication", async ({ request }) => {
  const response = await request.get("/admin");
  expect(response.status()).toBe(401);
});

test("admin area is reachable with the right credentials", async ({
  browser,
}) => {
  const context = await browser.newContext({
    httpCredentials: { username: "e2e-admin", password: "e2e-password" },
  });
  const page = await context.newPage();

  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: /visão geral/i })).toBeVisible();

  await page.goto("/admin/profissionais");
  await expect(page.getByRole("heading", { name: /profissionais/i })).toBeVisible();

  // Sem Supabase configurado neste ambiente, o detalhe de um profissional
  // qualquer mostra o estado "não configurado" em vez de quebrar.
  await page.goto("/admin/profissionais/11111111-1111-1111-1111-111111111111");
  await expect(
    page.getByText(/supabase ainda não está configurado/i)
  ).toBeVisible();

  await context.close();
});

test("professional application form validates and submits", async ({
  page,
}) => {
  await page.goto("/profissionais/cadastro");

  await expect(
    page.getByRole("heading", { name: /candidate-se para a vero/i })
  ).toBeVisible();

  await page.getByLabel(/nome completo/i).fill("Maria Silva");
  await page.getByLabel(/^email$/i).fill("maria@example.com");
  await page.getByLabel(/anos de experiência/i).fill("10");
  await page
    .getByLabel(/fale sobre sua experiência/i)
    .fill("Psicóloga com 10 anos de experiência em TCC.");
  await page.getByLabel(/^especialidades$/i).fill("Ansiedade, Burnout");
  await page.getByLabel(/preço por sessão/i).fill("250");
  await page.getByRole("button", { name: /enviar candidatura/i }).click();

  // Sem Supabase configurado neste ambiente de teste, a API responde 503.
  await expect(page.getByRole("alert")).toBeVisible();
});
