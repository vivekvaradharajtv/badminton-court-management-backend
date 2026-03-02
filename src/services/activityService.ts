import { prisma } from '../lib/prisma';

export interface CreateActivityInput {
  academyId: string;
  courtId: string;
  name?: string;
  startTime: string; // HH:mm
  endTime: string;
  startDate: Date;
  monthlyFee: number;
  maxPlayers: number;
  isActive?: boolean;
}

export interface UpdateActivityInput {
  name?: string;
  startTime?: string;
  endTime?: string;
  monthlyFee?: number;
  maxPlayers?: number;
  isActive?: boolean;
  courtId?: string;
}

export interface ListActivitiesOptions {
  academyId: string;
  courtId?: string;
  limit?: number;
  offset?: number;
}

/** Parse "HH:mm" to minutes since midnight */
function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** Check if [s1,e1) overlaps [s2,e2) in minutes */
function overlaps(
  s1: number,
  e1: number,
  s2: number,
  e2: number
): boolean {
  return s1 < e2 && s2 < e1;
}

/** Check if activity time range overlaps any existing activity on the same court */
export async function hasOverlap(
  courtId: string,
  startTime: string,
  endTime: string,
  excludeActivityId?: string
): Promise<boolean> {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  if (start >= end) return true; // invalid range

  const existing = await prisma.activity.findMany({
    where: {
      courtId,
      isActive: true,
      ...(excludeActivityId && { id: { not: excludeActivityId } }),
    },
    select: { startTime: true, endTime: true },
  });

  for (const a of existing) {
    if (overlaps(start, end, timeToMinutes(a.startTime), timeToMinutes(a.endTime))) {
      return true;
    }
  }
  return false;
}

export async function createActivity(input: CreateActivityInput) {
  if (input.maxPlayers <= 0) {
    const err = new Error('max_players must be greater than 0');
    (err as Error & { code?: string }).code = 'VALIDATION_ERROR';
    throw err;
  }
  if (input.monthlyFee <= 0) {
    const err = new Error('monthly_fee must be greater than 0');
    (err as Error & { code?: string }).code = 'VALIDATION_ERROR';
    throw err;
  }
  const startM = timeToMinutes(input.startTime);
  const endM = timeToMinutes(input.endTime);
  if (startM >= endM) {
    const err = new Error('start_time must be before end_time');
    (err as Error & { code?: string }).code = 'VALIDATION_ERROR';
    throw err;
  }

  const overlap = await hasOverlap(input.courtId, input.startTime, input.endTime);
  if (overlap) {
    const err = new Error('Activity time overlaps with another activity on this court');
    (err as Error & { code?: string }).code = 'OVERLAP';
    throw err;
  }

  const court = await prisma.court.findFirst({
    where: { id: input.courtId, academyId: input.academyId },
  });
  if (!court) {
    const err = new Error('Court not found');
    (err as Error & { code?: string }).code = 'NOT_FOUND';
    throw err;
  }

  return prisma.activity.create({
    data: {
      academyId: input.academyId,
      courtId: input.courtId,
      name: input.name ?? null,
      startTime: input.startTime,
      endTime: input.endTime,
      startDate: input.startDate,
      monthlyFee: input.monthlyFee,
      maxPlayers: input.maxPlayers,
      isActive: input.isActive ?? true,
    },
  });
}

export async function listActivities(options: ListActivitiesOptions) {
  const { academyId, courtId, limit = 50, offset = 0 } = options;
  const where = { academyId, ...(courtId && { courtId }) };
  const [activities, total] = await Promise.all([
    prisma.activity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 100),
      skip: offset,
      include: { court: { select: { id: true, name: true } } },
    }),
    prisma.activity.count({ where }),
  ]);
  return { activities, total };
}

export async function getActivityById(id: string, academyId: string) {
  return prisma.activity.findFirst({
    where: { id, academyId },
    include: { court: { select: { id: true, name: true } } },
  });
}

export async function updateActivity(
  id: string,
  academyId: string,
  input: UpdateActivityInput
) {
  const activity = await getActivityById(id, academyId);
  if (!activity) return null;

  const hasBills = await prisma.bill.count({ where: { activityId: id } }) > 0;
  if (hasBills && (input as { startDate?: Date }).startDate !== undefined) {
    const err = new Error('Cannot change start_date once billing exists');
    (err as Error & { code?: string }).code = 'VALIDATION_ERROR';
    throw err;
  }

  const startTime = input.startTime ?? activity.startTime;
  const endTime = input.endTime ?? activity.endTime;
  const courtId = input.courtId ?? activity.courtId;

  if (input.maxPlayers !== undefined && input.maxPlayers <= 0) {
    const err = new Error('max_players must be greater than 0');
    (err as Error & { code?: string }).code = 'VALIDATION_ERROR';
    throw err;
  }
  if (input.monthlyFee !== undefined && input.monthlyFee <= 0) {
    const err = new Error('monthly_fee must be greater than 0');
    (err as Error & { code?: string }).code = 'VALIDATION_ERROR';
    throw err;
  }
  const startM = timeToMinutes(startTime);
  const endM = timeToMinutes(endTime);
  if (startM >= endM) {
    const err = new Error('start_time must be before end_time');
    (err as Error & { code?: string }).code = 'VALIDATION_ERROR';
    throw err;
  }

  const overlap = await hasOverlap(courtId, startTime, endTime, id);
  if (overlap) {
    const err = new Error('Activity time overlaps with another activity on this court');
    (err as Error & { code?: string }).code = 'OVERLAP';
    throw err;
  }

  return prisma.activity.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.startTime !== undefined && { startTime: input.startTime }),
      ...(input.endTime !== undefined && { endTime: input.endTime }),
      ...(input.monthlyFee !== undefined && { monthlyFee: input.monthlyFee }),
      ...(input.maxPlayers !== undefined && { maxPlayers: input.maxPlayers }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
      ...(input.courtId !== undefined && { courtId: input.courtId }),
    },
    include: { court: { select: { id: true, name: true } } },
  });
}

export async function deactivateActivity(id: string, academyId: string) {
  const activity = await getActivityById(id, academyId);
  if (!activity) return null;
  return prisma.activity.update({
    where: { id },
    data: { isActive: false },
    include: { court: { select: { id: true, name: true } } },
  });
}
