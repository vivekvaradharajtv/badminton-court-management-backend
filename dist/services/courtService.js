"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCourt = createCourt;
exports.listCourts = listCourts;
exports.getCourtById = getCourtById;
exports.updateCourt = updateCourt;
const prisma_1 = require("../lib/prisma");
async function createCourt(input) {
    return prisma_1.prisma.court.create({
        data: {
            academyId: input.academyId,
            name: input.name,
            isActive: input.isActive ?? true,
        },
    });
}
async function listCourts(options) {
    const { academyId, limit = 50, offset = 0 } = options;
    const [courts, total] = await Promise.all([
        prisma_1.prisma.court.findMany({
            where: { academyId },
            orderBy: { createdAt: 'desc' },
            take: Math.min(limit, 100),
            skip: offset,
        }),
        prisma_1.prisma.court.count({ where: { academyId } }),
    ]);
    return { courts, total };
}
async function getCourtById(id, academyId) {
    return prisma_1.prisma.court.findFirst({
        where: { id, academyId },
    });
}
async function updateCourt(id, academyId, input) {
    const court = await getCourtById(id, academyId);
    if (!court)
        return null;
    return prisma_1.prisma.court.update({
        where: { id },
        data: {
            ...(input.name !== undefined && { name: input.name }),
            ...(input.isActive !== undefined && { isActive: input.isActive }),
        },
    });
}
//# sourceMappingURL=courtService.js.map