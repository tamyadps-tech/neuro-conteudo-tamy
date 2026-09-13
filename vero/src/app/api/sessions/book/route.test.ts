import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "./route";

const VALID_PROFESSIONAL_ID = "11111111-1111-1111-1111-111111111111";
const FUTURE_SLOT = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

const VALID_BODY = {
  professionalId: VALID_PROFESSIONAL_ID,
  slot: FUTURE_SLOT,
  clientName: "João Silva",
  clientEmail: "joao@example.com",
};

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/sessions/book", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/sessions/book", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("rejects a non-UUID professionalId", async () => {
    const response = await POST(
      makeRequest({ ...VALID_BODY, professionalId: "not-a-uuid" })
    );
    expect(response.status).toBe(400);
  });

  it("rejects a slot in the past", async () => {
    const response = await POST(
      makeRequest({ ...VALID_BODY, slot: new Date(Date.now() - 60_000).toISOString() })
    );
    expect(response.status).toBe(400);
  });

  it("rejects a malformed slot", async () => {
    const response = await POST(makeRequest({ ...VALID_BODY, slot: "not-a-date" }));
    expect(response.status).toBe(400);
  });

  it("rejects a short client name", async () => {
    const response = await POST(makeRequest({ ...VALID_BODY, clientName: "Jo" }));
    expect(response.status).toBe(400);
  });

  it("rejects a malformed client email", async () => {
    const response = await POST(
      makeRequest({ ...VALID_BODY, clientEmail: "not-an-email" })
    );
    expect(response.status).toBe(400);
  });

  it("returns 503 when Supabase isn't configured yet", async () => {
    const response = await POST(makeRequest(VALID_BODY));
    expect(response.status).toBe(503);
  });
});
