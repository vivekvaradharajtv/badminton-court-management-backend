import { prisma } from '../lib/prisma';

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
