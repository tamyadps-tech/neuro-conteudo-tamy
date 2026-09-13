import { test, expect } from "@playwright/test";

test("search page shows an honest empty state without Supabase configured", async ({
  page,
}) => {
  await page.goto("/profissionais");

  await expect(
    page.getByRole("heading", { name: /encontre um profissional/i })
  ).toBeVisible();
  await expect(page.getByLabel(/buscar profissionais/i)).toBeVisible();
  await expect(
    page.getByText(/ainda não temos profissionais aprovados no ar/i)
  ).toBeVisible();
});

test("filters update the URL", async ({ page }) => {
  await page.goto("/profissionais");

  await page
    .getByLabel(/filtrar por categoria/i)
    .selectOption("psicologo");

  await expect(page).toHaveURL(/category=psicologo/);
});

test("profile page for an unknown id doesn't crash", async ({ page }) => {
  const response = await page.goto("/profissionais/unknown-id");
  expect(response?.status()).toBe(200);
});
