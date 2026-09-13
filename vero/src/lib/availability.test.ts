import { describe, it, expect } from "vitest";
import { getUpcomingSlots } from "./availability";

// Quarta-feira, 10 de junho de 2026, 09:00 — fixo pra tornar os testes determinísticos.
const NOW = new Date(2026, 5, 10, 9, 0, 0);

describe("getUpcomingSlots", () => {
  it("returns concrete future datetimes for matching weekday rules", () => {
    const slots = getUpcomingSlots({
      rules: [{ weekday: 3, startTime: "14:00" }], // quarta
      bookedSessions: [],
      now: NOW,
      daysAhead: 14,
    });

    // A primeira ocorrência de quarta às 14:00 é hoje mesmo (10/06).
    expect(slots[0]).toEqual(new Date(2026, 5, 10, 14, 0, 0));
    // A segunda é na quarta seguinte.
    expect(slots[1]).toEqual(new Date(2026, 5, 17, 14, 0, 0));
  });

  it("excludes slots earlier than minLeadHours from now", () => {
    const slots = getUpcomingSlots({
      rules: [{ weekday: 3, startTime: "10:00" }], // hoje às 10h, só 1h à frente
      bookedSessions: [],
      now: NOW,
      minLeadHours: 2,
      daysAhead: 10,
    });

    // A ocorrência de hoje (10h) fica de fora; só sobra a da próxima semana.
    expect(slots).toHaveLength(1);
    expect(slots[0]).toEqual(new Date(2026, 5, 17, 10, 0, 0));
  });

  it("excludes slots that are already booked", () => {
    const bookedIso = new Date(2026, 5, 10, 14, 0, 0).toISOString();
    const slots = getUpcomingSlots({
      rules: [{ weekday: 3, startTime: "14:00" }],
      bookedSessions: [{ scheduledAt: bookedIso }],
      now: NOW,
      daysAhead: 14,
    });

    expect(slots).not.toContainEqual(new Date(2026, 5, 10, 14, 0, 0));
    expect(slots[0]).toEqual(new Date(2026, 5, 17, 14, 0, 0));
  });

  it("respects the daysAhead window", () => {
    const slots = getUpcomingSlots({
      rules: [{ weekday: 3, startTime: "14:00" }],
      bookedSessions: [],
      now: NOW,
      daysAhead: 6, // menos de uma semana — só a ocorrência de hoje cabe
    });

    expect(slots).toHaveLength(1);
  });

  it("returns slots sorted chronologically across multiple rules", () => {
    const slots = getUpcomingSlots({
      rules: [
        { weekday: 5, startTime: "09:00" }, // sexta
        { weekday: 3, startTime: "16:00" }, // quarta
      ],
      bookedSessions: [],
      now: NOW,
      daysAhead: 7,
    });

    const times = slots.map((s) => s.getTime());
    expect(times).toEqual([...times].sort((a, b) => a - b));
  });

  it("returns an empty array when there are no rules", () => {
    expect(
      getUpcomingSlots({ rules: [], bookedSessions: [], now: NOW })
    ).toEqual([]);
  });
});
