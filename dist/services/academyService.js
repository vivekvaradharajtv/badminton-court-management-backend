"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAcademySettings = getAcademySettings;
exports.updateAcademySettings = updateAcademySettings;
const prisma_1 = require("../lib/prisma");
const DEFAULT_OPENING = '06:00';
const DEFAULT_CLOSING = '22:00';
/** Parse "HH:mm" or "H:mm" to minutes since midnight */
function timeToMinutes(t) {
    const [h, m] = t.trim().split(':').map((s) => parseInt(s, 10));
    return (h ?? 0) * 60 + (m ?? 0);
}
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
async function updateAcademySettings(academyId, input, options) {
    const academy = await prisma_1.prisma.academy.findUnique({
        where: { id: academyId },
    });
    if (!academy)
        return null;
    const current = academy;
    const hasOpening = input.opening_time !== undefined && input.opening_time !== null && String(input.opening_time).trim() !== '';
    const hasClosing = input.closing_time !== undefined && input.closing_time !== null && String(input.closing_time).trim() !== '';
    const newOpening = hasOpening ? String(input.opening_time).trim() : (current.openingTime ?? DEFAULT_OPENING);
    const newClosing = hasClosing ? String(input.closing_time).trim() : (current.closingTime ?? DEFAULT_CLOSING);
    if (hasOpening || hasClosing) {
        const openMins = timeToMinutes(newOpening);
        const closeMins = timeToMinutes(newClosing);
        const activities = await prisma_1.prisma.activity.findMany({
            where: { academyId, isActive: true },
            select: { id: true, name: true, startTime: true, endTime: true, court: { select: { name: true } } },
        });
        const conflicting = [];
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
                message: 'Some activities would fall outside the new working hours. Send confirmed: true to apply anyway.',
            };
        }
    }
    const updated = await prisma_1.prisma.academy.update({
        where: { id: academyId },
        data: {
            ...(hasOpening && { openingTime: String(input.opening_time).trim() }),
            ...(hasClosing && { closingTime: String(input.closing_time).trim() }),
            ...(input.slot_duration !== undefined && input.slot_duration !== null && {
                slotDurationMins: input.slot_duration,
            }),
        },
        select: { openingTime: true, closingTime: true, slotDurationMins: true },
    });
    const result = updated;
    return {
        updated: true,
        settings: {
            opening_time: result.openingTime,
            closing_time: result.closingTime,
            slot_duration: result.slotDurationMins,
        },
    };
}
//# sourceMappingURL=academyService.js.map