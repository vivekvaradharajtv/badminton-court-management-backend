"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMember = addMember;
exports.listMembers = listMembers;
exports.getMemberById = getMemberById;
exports.updateMember = updateMember;
exports.deleteMember = deleteMember;
const prisma_1 = require("../lib/prisma");
async function addMember(input) {
    const activity = await prisma_1.prisma.activity.findFirst({
        where: { id: input.activityId, academyId: input.academyId },
    });
    if (!activity) {
        const err = new Error('Activity not found');
        err.code = 'NOT_FOUND';
        throw err;
    }
    if (input.isCaptain) {
        await prisma_1.prisma.activityMember.updateMany({
            where: { activityId: input.activityId },
            data: { isCaptain: false },
        });
    }
    return prisma_1.prisma.activityMember.create({
        data: {
            academyId: input.academyId,
            activityId: input.activityId,
            name: input.name,
            phone: input.phone ?? null,
            isCaptain: input.isCaptain ?? false,
        },
    });
}
async function listMembers(activityId, academyId) {
    const activity = await prisma_1.prisma.activity.findFirst({
        where: { id: activityId, academyId },
    });
    if (!activity)
        return null;
    return prisma_1.prisma.activityMember.findMany({
        where: { activityId, academyId },
        orderBy: { createdAt: 'asc' },
    });
}
async function getMemberById(memberId, academyId) {
    return prisma_1.prisma.activityMember.findFirst({
        where: { id: memberId, academyId },
    });
}
async function updateMember(memberId, academyId, input) {
    const member = await getMemberById(memberId, academyId);
    if (!member)
        return null;
    if (input.isCaptain === true) {
        await prisma_1.prisma.activityMember.updateMany({
            where: { activityId: member.activityId },
            data: { isCaptain: false },
        });
    }
    return prisma_1.prisma.activityMember.update({
        where: { id: memberId },
        data: {
            ...(input.name !== undefined && { name: input.name }),
            ...(input.phone !== undefined && { phone: input.phone }),
            ...(input.isCaptain !== undefined && { isCaptain: input.isCaptain }),
        },
    });
}
async function deleteMember(memberId, academyId) {
    const member = await getMemberById(memberId, academyId);
    if (!member)
        return null;
    await prisma_1.prisma.activityMember.delete({ where: { id: memberId } });
    return { deleted: true };
}
//# sourceMappingURL=activityMemberService.js.map