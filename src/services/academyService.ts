import { prisma } from '../lib/prisma';

const DEFAULT_OPENING = '06:00';
const DEFAULT_CLOSING = '22:00';

/** Parse "HH:mm" or "H:mm" to minutes since midnight */
function timeToMinutes(t: string): number {
  const [h, m] = t.trim().split(':').map((s) => parseInt(s, 10));
  return (h ?? 0) * 60 + (m ?? 0);
}

export interface WorkHoursSettings {
  opening_time?: string | null;
  closing_time?: string | null;
  slot_duration?: number | null;
}

export interface ConflictingActivity {
  id: string;
  name: string | null;
  start_time: string;
  end_time: string;
  court_name: string;
}

export type UpdateSettingsResult =
  | { updated: true; settings: { opening_time: string | null; closing_time: string | null; slot_duration: number | null } }
  | {
      updated: false;
      requiresConfirmation: true;
      conflictingActivities: ConflictingActivity[];
      message: string;
    }
  | null;

export async function getAcademySettings(academyId: string) {
  const academy = await prisma.academy.findUnique({
    where: { id: academyId },
    select: { openingTime: true, closingTime: true, slotDurationMins: true } as Record<string, boolean>,
  });
  if (!academy) return null;
  const a = academy as unknown as { openingTime: string | null; closingTime: string | null; slotDurationMins: number | null };
  return {
    opening_time: a.openingTime,
    closing_time: a.closingTime,
    slot_duration: a.slotDurationMins,
  };
}

export async function updateAcademySettings(
  academyId: string,
  input: WorkHoursSettings,
  options?: { confirmed?: boolean }
): Promise<UpdateSettingsResult> {
  const academy = await prisma.academy.findUnique({
    where: { id: academyId },
  });
  if (!academy) return null;

  const current = academy as unknown as { openingTime: string | null; closingTime: string | null; slotDurationMins: number | null };

  const hasOpening = input.opening_time !== undefined && input.opening_time !== null && String(input.opening_time).trim() !== '';
  const hasClosing = input.closing_time !== undefined && input.closing_time !== null && String(input.closing_time).trim() !== '';

  const newOpening = hasOpening ? String(input.opening_time).trim() : (current.openingTime ?? DEFAULT_OPENING);
  const newClosing = hasClosing ? String(input.closing_time).trim() : (current.closingTime ?? DEFAULT_CLOSING);

  if (hasOpening || hasClosing) {
    const openMins = timeToMinutes(newOpening);
    const closeMins = timeToMinutes(newClosing);

    const activities = await prisma.activity.findMany({
      where: { academyId, isActive: true },
      select: { id: true, name: true, startTime: true, endTime: true, court: { select: { name: true } } },
    });

    const conflicting: ConflictingActivity[] = [];
    for (const a of activities) {
      const startMins = timeToMinutes(String(a.startTime).trim());
      const endMins = timeToMinutes(String(a.endTime).trim());
      const startsBeforeOpen = startMins < openMins;
      const endsAfterClose = endMins > closeMins;
      if (startsBeforeOpen || endsAfterClose) {
        conflicting.push({
          id: a.id,
          name: a.name,
          start_time: a.startTime,
          end_time: a.endTime,
          court_name: a.court.name,
        });
      }
    }

    if (conflicting.length > 0 && !options?.confirmed) {
      return {
        updated: false,
        requiresConfirmation: true,
        conflictingActivities: conflicting,
        message:
          'Some activities would fall outside the new working hours. Send confirmed: true to apply anyway.',
      };
    }
  }

  const updated = await prisma.academy.update({
    where: { id: academyId },
    data: {
      ...(hasOpening && { openingTime: String(input.opening_time).trim() }),
      ...(hasClosing && { closingTime: String(input.closing_time).trim() }),
      ...(input.slot_duration !== undefined && input.slot_duration !== null && {
        slotDurationMins: input.slot_duration,
      }),
    },
    select: { openingTime: true, closingTime: true, slotDurationMins: true } as Record<string, boolean>,
  });
  const result = updated as unknown as { openingTime: string | null; closingTime: string | null; slotDurationMins: number | null };
  return {
    updated: true,
    settings: {
      opening_time: result.openingTime,
      closing_time: result.closingTime,
      slot_duration: result.slotDurationMins,
    },
  };
}
