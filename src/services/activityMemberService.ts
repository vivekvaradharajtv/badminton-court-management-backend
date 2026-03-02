import { prisma } from '../lib/prisma';

export interface AddMemberInput {
  academyId: string;
  activityId: string;
  name: string;
  phone?: string;
  isCaptain?: boolean;
}

export interface UpdateMemberInput {
  name?: string;
  phone?: string;
  isCaptain?: boolean;
}

export async function addMember(input: AddMemberInput) {
  const activity = await prisma.activity.findFirst({
    where: { id: input.activityId, academyId: input.academyId },
  });
  if (!activity) {
    const err = new Error('Activity not found');
    (err as Error & { code?: string }).code = 'NOT_FOUND';
    throw err;
  }

  if (input.isCaptain) {
    await prisma.activityMember.updateMany({
      where: { activityId: input.activityId },
      data: { isCaptain: false },
    });
  }

  return prisma.activityMember.create({
    data: {
      academyId: input.academyId,
      activityId: input.activityId,
      name: input.name,
      phone: input.phone ?? null,
      isCaptain: input.isCaptain ?? false,
    },
  });
}

export async function listMembers(activityId: string, academyId: string) {
  const activity = await prisma.activity.findFirst({
    where: { id: activityId, academyId },
  });
  if (!activity) return null;

  return prisma.activityMember.findMany({
    where: { activityId, academyId },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getMemberById(memberId: string, academyId: string) {
  return prisma.activityMember.findFirst({
    where: { id: memberId, academyId },
  });
}

export async function updateMember(
  memberId: string,
  academyId: string,
  input: UpdateMemberInput
) {
  const member = await getMemberById(memberId, academyId);
  if (!member) return null;

  if (input.isCaptain === true) {
    await prisma.activityMember.updateMany({
      where: { activityId: member.activityId },
      data: { isCaptain: false },
    });
  }

  return prisma.activityMember.update({
    where: { id: memberId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.isCaptain !== undefined && { isCaptain: input.isCaptain }),
    },
  });
}

export async function deleteMember(memberId: string, academyId: string) {
  const member = await getMemberById(memberId, academyId);
  if (!member) return null;
  await prisma.activityMember.delete({ where: { id: memberId } });
  return { deleted: true };
}
