import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "./route";

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/admin/professionals/abc/availability", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/admin/professionals/[id]/availability", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("rejects an invalid weekday", async () => {
    const response = await POST(makeRequest({ weekday: 9, startTime: "09:00" }), {
      params: Promise.resolve({ id: "abc" }),
    });
    expect(response.status).toBe(400);
  });

  it("rejects a malformed time", async () => {
    const response = await POST(makeRequest({ weekday: 1, startTime: "9am" }), {
      params: Promise.resolve({ id: "abc" }),
    });
    expect(response.status).toBe(400);
  });

  it("returns 503 when Supabase isn't configured yet", async () => {
    const response = await POST(makeRequest({ weekday: 1, startTime: "09:00" }), {
      params: Promise.resolve({ id: "abc" }),
    });
    expect(response.status).toBe(503);
  });
});
