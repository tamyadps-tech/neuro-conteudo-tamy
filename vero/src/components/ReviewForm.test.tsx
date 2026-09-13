import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReviewForm } from "./ReviewForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

const TOKEN = "11111111-1111-1111-1111-111111111111";
const SESSION_ID = "22222222-2222-2222-2222-222222222222";

describe("ReviewForm", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requires a rating before submitting", async () => {
    const user = userEvent.setup();
    render(<ReviewForm token={TOKEN} sessionId={SESSION_ID} />);

    await user.click(screen.getByRole("button", { name: /enviar avaliação/i }));

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(/escolha uma nota/i);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("submits the chosen rating and comment", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) });

    const user = userEvent.setup();
    render(<ReviewForm token={TOKEN} sessionId={SESSION_ID} />);

    await user.click(screen.getByRole("radio", { name: /4 estrelas/i }));
    await user.type(screen.getByPlaceholderText(/comentário opcional/i), "Muito bom");
    await user.click(screen.getByRole("button", { name: /enviar avaliação/i }));

    await waitFor(() =>
      expect(screen.getByText(/obrigado pela avaliação/i)).toBeInTheDocument()
    );

    const [, options] = fetchMock.mock.calls[0];
    expect(JSON.parse(options.body)).toEqual({
      token: TOKEN,
      sessionId: SESSION_ID,
      rating: 4,
      comment: "Muito bom",
    });
  });
});
