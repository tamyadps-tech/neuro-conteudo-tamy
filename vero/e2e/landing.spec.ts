import { test, expect } from "@playwright/test";

test("landing page shows the Vero value proposition and waitlist form", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Vero/);
  await expect(
    page.getByRole("heading", { name: /profissionais verificados/i })
  ).toBeVisible();

  const emailInput = page.getByLabel(/seu email/i).first();
  await expect(emailInput).toBeVisible();
  await expect(page.getByRole("link", { name: /termo de uso/i })).toBeVisible();
});

test("waitlist form surfaces an error when the backend isn't configured yet", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByLabel(/seu email/i).first().fill("teste@example.com");
  await page
    .getByRole("button", { name: /entrar na lista/i })
    .first()
    .click();

  await expect(page.getByRole("alert").first()).toBeVisible();
});

test("legal pages render the Termo de Uso and Política de Privacidade", async ({
  page,
}) => {
  await page.goto("/termos");
  await expect(
    page.getByRole("heading", { name: /termo de uso/i, level: 1 })
  ).toBeVisible();

  await page.goto("/privacidade");
  await expect(
    page.getByRole("heading", { name: /política de privacidade/i, level: 1 })
  ).toBeVisible();
});
