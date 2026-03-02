import { prisma } from '../lib/prisma';

export interface WorkHoursSettings {
  opening_time?: string | null;
  closing_time?: string | null;
  slot_duration?: number | null;
}

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
  input: WorkHoursSettings
): Promise<{ opening_time: string | null; closing_time: string | null; slot_duration: number | null } | null> {
  const academy = await prisma.academy.findUnique({
    where: { id: academyId },
  });
  if (!academy) return null;

  const updated = await prisma.academy.update({
    where: { id: academyId },
    data: {
      ...(input.opening_time !== undefined && { openingTime: input.opening_time }),
      ...(input.closing_time !== undefined && { closingTime: input.closing_time }),
      ...(input.slot_duration !== undefined && {
        slotDurationMins: input.slot_duration,
      }),
    },
    select: { openingTime: true, closingTime: true, slotDurationMins: true } as Record<string, boolean>,
  });
  const result = updated as unknown as { openingTime: string | null; closingTime: string | null; slotDurationMins: number | null };
  return {
    opening_time: result.openingTime,
    closing_time: result.closingTime,
    slot_duration: result.slotDurationMins,
  };
}
