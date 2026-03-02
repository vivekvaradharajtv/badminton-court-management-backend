"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAcademySettings = getAcademySettings;
exports.updateAcademySettings = updateAcademySettings;
const prisma_1 = require("../lib/prisma");
async function getAcademySettings(academyId) {
    const academy = await prisma_1.prisma.academy.findUnique({
        where: { id: academyId },
        select: { openingTime: true, closingTime: true, slotDurationMins: true },
    });
    if (!academy)
        return null;
    const a = academy;
    return {
        opening_time: a.openingTime,
        closing_time: a.closingTime,
        slot_duration: a.slotDurationMins,
    };
}
async function updateAcademySettings(academyId, input) {
    const academy = await prisma_1.prisma.academy.findUnique({
        where: { id: academyId },
    });
    if (!academy)
        return null;
    const updated = await prisma_1.prisma.academy.update({
        where: { id: academyId },
        data: {
            ...(input.opening_time !== undefined && { openingTime: input.opening_time }),
            ...(input.closing_time !== undefined && { closingTime: input.closing_time }),
            ...(input.slot_duration !== undefined && {
                slotDurationMins: input.slot_duration,
            }),
        },
        select: { openingTime: true, closingTime: true, slotDurationMins: true },
    });
    const result = updated;
    return {
        opening_time: result.openingTime,
        closing_time: result.closingTime,
        slot_duration: result.slotDurationMins,
    };
}
//# sourceMappingURL=academyService.js.map