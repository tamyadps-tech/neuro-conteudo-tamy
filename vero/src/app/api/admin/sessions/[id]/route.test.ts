import { describe, it, expect, beforeEach } from "vitest";
import { PATCH } from "./route";

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/admin/sessions/abc", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

describe("PATCH /api/admin/sessions/[id]", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("rejects an empty body (nothing to update)", async () => {
    const response = await PATCH(makeRequest({}), {
      params: Promise.resolve({ id: "abc" }),
    });
    expect(response.status).toBe(400);
  });

  it("rejects invalid topics", async () => {
    const response = await PATCH(makeRequest({ topics: [1, 2] }), {
      params: Promise.resolve({ id: "abc" }),
    });
    expect(response.status).toBe(400);
  });

  it("rejects an invalid next session date", async () => {
    const response = await PATCH(
      makeRequest({ nextSessionAt: "not-a-date" }),
      { params: Promise.resolve({ id: "abc" }) }
    );
    expect(response.status).toBe(400);
  });

  it("rejects an invalid status", async () => {
    const response = await PATCH(makeRequest({ status: "sumiu" }), {
      params: Promise.resolve({ id: "abc" }),
    });
    expect(response.status).toBe(400);
  });

  it("accepts clearing the next session date", async () => {
    const response = await PATCH(makeRequest({ nextSessionAt: null }), {
      params: Promise.resolve({ id: "abc" }),
    });
    // 503 porque o Supabase não está configurado — passou da validação.
    expect(response.status).toBe(503);
  });

  it("returns 503 when Supabase isn't configured yet", async () => {
    const response = await PATCH(makeRequest({ status: "concluida" }), {
      params: Promise.resolve({ id: "abc" }),
    });
    expect(response.status).toBe(503);
  });
});
