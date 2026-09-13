export interface AvailabilityRule {
  /** 0 = domingo ... 6 = sábado (mesma convenção do JS Date#getDay). */
  weekday: number;
  /** "HH:MM", 24h. */
  startTime: string;
}

export interface BookedSession {
  scheduledAt: string;
}

export interface GetUpcomingSlotsOptions {
  rules: AvailabilityRule[];
  bookedSessions: BookedSession[];
  now?: Date;
  /** Quantos dias à frente considerar. */
  daysAhead?: number;
  /** Não oferecer horários daqui a menos que isso (evita marcar "em cima da hora"). */
  minLeadHours?: number;
}

/**
 * Calcula horários concretos e disponíveis a partir de regras semanais
 * recorrentes, excluindo o que já está reservado e o que é cedo demais.
 *
 * Simplificação deliberada: sem conversão de fuso horário — tudo é tratado
 * como horário local do servidor. Revisar se/quando a Vero tiver
 * profissionais e clientes em fusos diferentes.
 */
export function getUpcomingSlots({
  rules,
  bookedSessions,
  now = new Date(),
  daysAhead = 14,
  minLeadHours = 2,
}: GetUpcomingSlotsOptions): Date[] {
  const bookedTimes = new Set(
    bookedSessions.map((s) => new Date(s.scheduledAt).getTime())
  );
  const earliestBookable = new Date(now.getTime() + minLeadHours * 60 * 60 * 1000);
  const slots: Date[] = [];

  for (let dayOffset = 0; dayOffset <= daysAhead; dayOffset++) {
    const day = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + dayOffset
    );
    const weekday = day.getDay();

    for (const rule of rules) {
      if (rule.weekday !== weekday) continue;

      const [hours, minutes] = rule.startTime.split(":").map(Number);
      const slot = new Date(
        day.getFullYear(),
        day.getMonth(),
        day.getDate(),
        hours,
        minutes,
        0,
        0
      );

      if (slot.getTime() < earliestBookable.getTime()) continue;
      if (bookedTimes.has(slot.getTime())) continue;

      slots.push(slot);
    }
  }

  slots.sort((a, b) => a.getTime() - b.getTime());
  return slots;
}

export const WEEKDAY_LABELS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
] as const;
