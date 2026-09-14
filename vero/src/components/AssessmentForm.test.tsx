import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AssessmentForm } from "./AssessmentForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

const TOKEN = "11111111-1111-1111-1111-111111111111";

describe("AssessmentForm", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("disables submit until every question is answered", async () => {
    const user = userEvent.setup();
    render(
      <AssessmentForm token={TOKEN} templateSlug="gad7" onClose={() => {}} />
    );

    const submit = screen.getByRole("button", { name: /ver resultado/i });
    expect(submit).toBeDisabled();

    const firstOption = screen.getAllByRole("radio", { name: /nunca/i })[0];
    await user.click(firstOption);
    expect(submit).toBeDisabled(); // ainda faltam as outras 6 perguntas
  });

  it("submits all answers in question order and shows the result", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, score: 0, maxScore: 21, severity: "Mínimo" }),
    });

    const user = userEvent.setup();
    render(
      <AssessmentForm token={TOKEN} templateSlug="gad7" onClose={() => {}} />
    );

    const neverOptions = screen.getAllByRole("radio", { name: /nunca/i });
    for (const option of neverOptions) {
      await user.click(option);
    }

    await user.click(screen.getByRole("button", { name: /ver resultado/i }));

    await waitFor(() =>
      expect(screen.getByText(/mínimo/i)).toBeInTheDocument()
    );

    const [, options] = fetchMock.mock.calls[0];
    const sentBody = JSON.parse(options.body);
    expect(sentBody).toEqual({
      token: TOKEN,
      templateSlug: "gad7",
      answers: new Array(7).fill(0),
    });
  });
});
