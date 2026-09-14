import { describe, it, expect, beforeEach } from "vitest";
import { PATCH } from "./route";

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/professional/sessions/abc", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

describe("PATCH /api/professional/sessions/[id]", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("rejects an empty body (nothing to update)", async () => {
    const response = await PATCH(makeRequest({ token: "any-token" }), {
      params: Promise.resolve({ id: "abc" }),
    });
    expect(response.status).toBe(400);
  });

  it("rejects an invalid status", async () => {
    const response = await PATCH(
      makeRequest({ token: "any-token", status: "sumiu" }),
      { params: Promise.resolve({ id: "abc" }) }
    );
    expect(response.status).toBe(400);
  });

  it("returns 503 when Supabase isn't configured yet", async () => {
    const response = await PATCH(
      makeRequest({ token: "any-token", status: "concluida" }),
      { params: Promise.resolve({ id: "abc" }) }
    );
    expect(response.status).toBe(503);
  });
});
