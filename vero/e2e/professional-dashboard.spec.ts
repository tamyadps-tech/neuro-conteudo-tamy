import { test, expect } from "@playwright/test";

test("professional dashboard shows an honest state without Supabase configured", async ({
  page,
}) => {
  const response = await page.goto(
    "/p/11111111-1111-1111-1111-111111111111"
  );
  expect(response?.status()).toBe(200);
  await expect(
    page.getByText(/essa área ainda não está disponível/i)
  ).toBeVisible();
});
