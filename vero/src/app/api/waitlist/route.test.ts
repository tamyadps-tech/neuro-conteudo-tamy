import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "./route";

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/waitlist", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/waitlist", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("rejects a malformed email", async () => {
    const response = await POST(makeRequest({ email: "not-an-email", role: "cliente" }));
    expect(response.status).toBe(400);
  });

  it("rejects an invalid role", async () => {
    const response = await POST(
      makeRequest({ email: "ana@example.com", role: "admin" })
    );
    expect(response.status).toBe(400);
  });

  it("returns 503 when Supabase isn't configured yet", async () => {
    const response = await POST(
      makeRequest({ email: "ana@example.com", role: "cliente" })
    );
    expect(response.status).toBe(503);
    const data = await response.json();
    expect(data.error).toMatch(/não está conectada/i);
  });
});
