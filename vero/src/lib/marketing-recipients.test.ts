import { describe, it, expect, beforeEach } from "vitest";
import { listRecipientEmails, RECIPIENT_SEGMENTS } from "./marketing-recipients";

describe("marketing-recipients", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("lists the three expected segments", () => {
    expect(RECIPIENT_SEGMENTS.map((s) => s.id)).toEqual([
      "waitlist-clientes",
      "waitlist-profissionais",
      "profissionais-aprovados",
    ]);
  });

  it("returns null when Supabase isn't configured yet", async () => {
    expect(await listRecipientEmails("waitlist-clientes")).toBeNull();
    expect(await listRecipientEmails("waitlist-profissionais")).toBeNull();
    expect(await listRecipientEmails("profissionais-aprovados")).toBeNull();
  });
});
