import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BookingWidget } from "./BookingWidget";

const PROFESSIONAL_ID = "11111111-1111-1111-1111-111111111111";
const SLOT_ISO = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

describe("BookingWidget", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows an honest empty state when there are no slots", () => {
    render(<BookingWidget professionalId={PROFESSIONAL_ID} slotsIso={[]} />);
    expect(
      screen.getByText(/sem horários disponíveis no momento/i)
    ).toBeInTheDocument();
  });

  it("lets the client pick a slot, fill the form, and book successfully", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    });

    const user = userEvent.setup();
    render(<BookingWidget professionalId={PROFESSIONAL_ID} slotsIso={[SLOT_ISO]} />);

    await user.click(screen.getByRole("button", { name: /·/ }));

    await user.type(screen.getByLabelText(/nome completo/i), "João Silva");
    await user.type(screen.getByLabelText(/^email$/i), "joao@example.com");
    await user.click(screen.getByRole("button", { name: /confirmar agendamento/i }));

    await waitFor(() =>
      expect(screen.getByText(/sessão agendada/i)).toBeInTheDocument()
    );

    const [, options] = fetchMock.mock.calls[0];
    const sentBody = JSON.parse(options.body);
    expect(sentBody).toMatchObject({
      professionalId: PROFESSIONAL_ID,
      slot: SLOT_ISO,
      clientName: "João Silva",
      clientEmail: "joao@example.com",
    });
  });

  it("shows an error when the slot is no longer available", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Esse horário não está mais disponível." }),
    });

    const user = userEvent.setup();
    render(<BookingWidget professionalId={PROFESSIONAL_ID} slotsIso={[SLOT_ISO]} />);

    await user.click(screen.getByRole("button", { name: /·/ }));
    await user.type(screen.getByLabelText(/nome completo/i), "João Silva");
    await user.type(screen.getByLabelText(/^email$/i), "joao@example.com");
    await user.click(screen.getByRole("button", { name: /confirmar agendamento/i }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Esse horário não está mais disponível."
      )
    );
  });
});
