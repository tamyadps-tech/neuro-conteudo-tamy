import { describe, it, expect } from "vitest";
import { bookingConfirmationEmail, sessionSummaryEmail } from "./email-templates";

describe("bookingConfirmationEmail", () => {
  it("includes the professional name in the subject and the progress link", () => {
    const { subject, html } = bookingConfirmationEmail({
      clientName: "Ana",
      professionalName: "Dra. Maria",
      scheduledAt: "2026-06-17T14:00:00.000Z",
      progressUrl: "https://vero.app/c/abc123",
    });
    expect(subject).toContain("Dra. Maria");
    expect(html).toContain("https://vero.app/c/abc123");
    expect(html).toContain("Ana");
  });

  it("escapes HTML in user-provided names (no injection into the email)", () => {
    const { html } = bookingConfirmationEmail({
      clientName: '<img src=x onerror="alert(1)">',
      professionalName: "Dra. Maria",
      scheduledAt: "2026-06-17T14:00:00.000Z",
      progressUrl: "https://vero.app/c/abc123",
    });
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;img");
  });
});

describe("sessionSummaryEmail", () => {
  it("renders topics, homework and next session when present", () => {
    const { html } = sessionSummaryEmail({
      clientName: "Ana",
      professionalName: "Dra. Maria",
      topics: ["Ansiedade", "Respiração"],
      homework: "Praticar 5 minutos por dia",
      nextSessionAt: "2026-06-24T14:00:00.000Z",
      progressUrl: "https://vero.app/c/abc123",
    });
    expect(html).toContain("Ansiedade");
    expect(html).toContain("Respiração");
    expect(html).toContain("Praticar 5 minutos por dia");
  });

  it("omits optional sections when there is nothing to show", () => {
    const { html } = sessionSummaryEmail({
      clientName: "Ana",
      professionalName: "Dra. Maria",
      topics: [],
      homework: null,
      nextSessionAt: null,
      progressUrl: "https://vero.app/c/abc123",
    });
    expect(html).not.toContain("Tópicos abordados");
    expect(html).not.toContain("Tarefa até a próxima sessão");
    expect(html).not.toContain("Próxima sessão");
  });
});
