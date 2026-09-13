import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WaitlistForm } from "./WaitlistForm";

describe("WaitlistForm", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("submits the email and role, then shows a success message", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    });

    const user = userEvent.setup();
    render(<WaitlistForm />);

    await user.type(screen.getByLabelText(/seu email/i), "ana@example.com");
    await user.selectOptions(
      screen.getByLabelText(/você é cliente ou profissional/i),
      "profissional"
    );
    await user.click(screen.getByRole("button", { name: /entrar na lista/i }));

    await waitFor(() =>
      expect(screen.getByText(/você está na lista/i)).toBeInTheDocument()
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/waitlist",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "ana@example.com", role: "profissional" }),
      })
    );
  });

  it("shows an error message when the request fails", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Email já cadastrado." }),
    });

    const user = userEvent.setup();
    render(<WaitlistForm />);

    await user.type(screen.getByLabelText(/seu email/i), "ana@example.com");
    await user.click(screen.getByRole("button", { name: /entrar na lista/i }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Email já cadastrado.")
    );
  });

  it("requires a well-formed email before submitting", () => {
    render(<WaitlistForm />);
    const input = screen.getByLabelText(/seu email/i) as HTMLInputElement;
    expect(input).toBeRequired();
    expect(input.type).toBe("email");
  });
});
