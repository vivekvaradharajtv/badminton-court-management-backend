import { prisma } from '../lib/prisma';
import * as academyService from './academyService';

const DEFAULT_OPENING = '06:00';
const DEFAULT_CLOSING = '22:00';
const DEFAULT_SLOT_MINS = 60;

/** Parse "HH:mm" or "H:mm" to minutes since midnight */
function timeToMinutes(t: string): number {
  const [h, m] = t.trim().split(':').map((s) => parseInt(s, 10));
  return (h ?? 0) * 60 + (m ?? 0);
}

/** Minutes since midnight to "HH:mm" */
function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export interface CourtSlot {
  start_time: string;
  end_time: string;
  activity: { id: string; name: string | null } | null;
  /** True when this slot is outside the academy's opening_time–closing_time */
  outside_working_hours?: boolean;
}

export interface CourtSlotsResult {
  court: { id: string; name: string };
  date: string;
  slots: CourtSlot[];
}

export async function getCourtSlots(
  courtId: string,
  academyId: string,
  date?: Date
): Promise<CourtSlotsResult | null> {
  const court = await getCourtById(courtId, academyId);
  if (!court) return null;

  const settings = await academyService.getAcademySettings(academyId);
  const opening = settings?.opening_time ?? DEFAULT_OPENING;
  const closing = settings?.closing_time ?? DEFAULT_CLOSING;
  const slotMins = settings?.slot_duration ?? DEFAULT_SLOT_MINS;

  const openMins = timeToMinutes(opening);
  const closeMins = timeToMinutes(closing);

  const d = date ?? new Date();
  const dayOfWeek = d.getDay(); // 0=Sun, 1=Mon, ... 6=Sat

  const activities = await prisma.activity.findMany({
    where: { courtId, academyId, isActive: true },
    select: { id: true, name: true, startTime: true, endTime: true, recurrenceDays: true },
  });

  const activitiesOnThisDay = activities.filter((a) =>
    a.recurrenceDays.includes(dayOfWeek)
  );

  const slots: CourtSlot[] = [];
  for (let m = openMins; m + slotMins <= closeMins; m += slotMins) {
    const slotStart = m;
    const slotEnd = m + slotMins;
    let activity: CourtSlot['activity'] = null;
    for (const a of activitiesOnThisDay) {
      const aStart = timeToMinutes(String(a.startTime).trim());
      const aEnd = timeToMinutes(String(a.endTime).trim());
      if (slotStart < aEnd && slotEnd > aStart) {
        activity = { id: a.id, name: a.name };
        break;
      }
    }
    slots.push({
      start_time: minutesToTime(slotStart),
      end_time: minutesToTime(slotEnd),
      activity,
      outside_working_hours: false,
    });
  }

  for (const a of activitiesOnThisDay) {
    const aStart = timeToMinutes(String(a.startTime).trim());
    const aEnd = timeToMinutes(String(a.endTime).trim());
    const activityInfo: CourtSlot['activity'] = { id: a.id, name: a.name };

    if (aStart < openMins) {
      const segmentEnd = Math.min(aEnd, openMins);
      if (segmentEnd > aStart) {
        slots.push({
          start_time: minutesToTime(aStart),
          end_time: minutesToTime(segmentEnd),
          activity: activityInfo,
          outside_working_hours: true,
        });
      }
    }
    if (aEnd > closeMins) {
      const segmentStart = Math.max(aStart, closeMins);
      if (aEnd > segmentStart) {
        slots.push({
          start_time: minutesToTime(segmentStart),
          end_time: minutesToTime(aEnd),
          activity: activityInfo,
          outside_working_hours: true,
        });
      }
    }
  }

  slots.sort((x, y) => {
    const xStart = timeToMinutes(x.start_time);
    const yStart = timeToMinutes(y.start_time);
    return xStart - yStart;
  });

  const dateStr = d.toISOString().slice(0, 10);

  return {
    court: { id: court.id, name: court.name },
    date: dateStr,
    slots,
  };
}

export interface CreateCourtInput {
  academyId: string;
  name: string;
  isActive?: boolean;
}

export interface UpdateCourtInput {
  name?: string;
  isActive?: boolean;
}

export interface ListCourtsOptions {
  academyId: string;
  limit?: number;
  offset?: number;
}

export async function createCourt(input: CreateCourtInput) {
  return prisma.court.create({
    data: {
      academyId: input.academyId,
      name: input.name,
      isActive: input.isActive ?? true,
    },
  });
}

export async function listCourts(options: ListCourtsOptions) {
  const { academyId, limit = 50, offset = 0 } = options;
  const [courts, total] = await Promise.all([
    prisma.court.findMany({
      where: { academyId },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 100),
      skip: offset,
    }),
    prisma.court.count({ where: { academyId } }),
  ]);
  return { courts, total };
}

export async function getCourtById(id: string, academyId: string) {
  return prisma.court.findFirst({
    where: { id, academyId },
  });
}

export async function updateCourt(
  id: string,
  academyId: string,
  input: UpdateCourtInput
) {
  const court = await getCourtById(id, academyId);
  if (!court) return null;
  return prisma.court.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    },
  });
}
