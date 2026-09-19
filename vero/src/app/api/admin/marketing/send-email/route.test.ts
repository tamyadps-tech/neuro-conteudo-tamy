import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { POST } from "./route";

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/admin/marketing/send-email", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/admin/marketing/send-email", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.BREVO_API_KEY;
    delete process.env.BREVO_FROM;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejects an invalid template id", async () => {
    const response = await POST(makeRequest({ templateId: "nao-existe", manualEmails: ["a@b.com"] }));
    expect(response.status).toBe(400);
  });

  it("rejects when neither segment nor manual emails are given", async () => {
    const response = await POST(makeRequest({ templateId: "convite" }));
    expect(response.status).toBe(400);
  });

  it("returns 503 when a segment is requested but Supabase isn't configured", async () => {
    const response = await POST(
      makeRequest({ templateId: "convite", segment: "waitlist-clientes" })
    );
    expect(response.status).toBe(503);
  });

  it("sends to manually provided emails without needing Supabase", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      makeRequest({ templateId: "convite", manualEmails: ["lead@example.com", "not-an-email"] })
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.recipientCount).toBe(1);
    // Sem BREVO configurado, o envio não falha a request — só não dispara de verdade.
    expect(json.sent).toBe(0);
    expect(json.failed).toBe(1);
  });
});
