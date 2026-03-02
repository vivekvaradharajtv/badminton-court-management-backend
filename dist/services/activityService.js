"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasOverlap = hasOverlap;
exports.createActivity = createActivity;
exports.listActivities = listActivities;
exports.getActivityById = getActivityById;
exports.updateActivity = updateActivity;
exports.deactivateActivity = deactivateActivity;
const prisma_1 = require("../lib/prisma");
/** Parse "HH:mm" to minutes since midnight */
function timeToMinutes(t) {
    const [h, m] = t.split(':').map(Number);
    return (h ?? 0) * 60 + (m ?? 0);
}
/** Check if [s1,e1) overlaps [s2,e2) in minutes */
function overlaps(s1, e1, s2, e2) {
    return s1 < e2 && s2 < e1;
}
/** Check if activity time range overlaps any existing activity on the same court */
async function hasOverlap(courtId, startTime, endTime, excludeActivityId) {
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);
    if (start >= end)
        return true; // invalid range
    const existing = await prisma_1.prisma.activity.findMany({
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
async function createActivity(input) {
    if (input.maxPlayers <= 0) {
        const err = new Error('max_players must be greater than 0');
        err.code = 'VALIDATION_ERROR';
        throw err;
    }
    if (input.monthlyFee <= 0) {
        const err = new Error('monthly_fee must be greater than 0');
        err.code = 'VALIDATION_ERROR';
        throw err;
    }
    const startM = timeToMinutes(input.startTime);
    const endM = timeToMinutes(input.endTime);
    if (startM >= endM) {
        const err = new Error('start_time must be before end_time');
        err.code = 'VALIDATION_ERROR';
        throw err;
    }
    const overlap = await hasOverlap(input.courtId, input.startTime, input.endTime);
    if (overlap) {
        const err = new Error('Activity time overlaps with another activity on this court');
        err.code = 'OVERLAP';
        throw err;
    }
    const court = await prisma_1.prisma.court.findFirst({
        where: { id: input.courtId, academyId: input.academyId },
    });
    if (!court) {
        const err = new Error('Court not found');
        err.code = 'NOT_FOUND';
        throw err;
    }
    return prisma_1.prisma.activity.create({
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
async function listActivities(options) {
    const { academyId, courtId, limit = 50, offset = 0 } = options;
    const where = { academyId, ...(courtId && { courtId }) };
    const [activities, total] = await Promise.all([
        prisma_1.prisma.activity.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: Math.min(limit, 100),
            skip: offset,
            include: { court: { select: { id: true, name: true } } },
        }),
        prisma_1.prisma.activity.count({ where }),
    ]);
    return { activities, total };
}
async function getActivityById(id, academyId) {
    return prisma_1.prisma.activity.findFirst({
        where: { id, academyId },
        include: { court: { select: { id: true, name: true } } },
    });
}
async function updateActivity(id, academyId, input) {
    const activity = await getActivityById(id, academyId);
    if (!activity)
        return null;
    const hasBills = await prisma_1.prisma.bill.count({ where: { activityId: id } }) > 0;
    if (hasBills && input.startDate !== undefined) {
        const err = new Error('Cannot change start_date once billing exists');
        err.code = 'VALIDATION_ERROR';
        throw err;
    }
    const startTime = input.startTime ?? activity.startTime;
    const endTime = input.endTime ?? activity.endTime;
    const courtId = input.courtId ?? activity.courtId;
    if (input.maxPlayers !== undefined && input.maxPlayers <= 0) {
        const err = new Error('max_players must be greater than 0');
        err.code = 'VALIDATION_ERROR';
        throw err;
    }
    if (input.monthlyFee !== undefined && input.monthlyFee <= 0) {
        const err = new Error('monthly_fee must be greater than 0');
        err.code = 'VALIDATION_ERROR';
        throw err;
    }
    const startM = timeToMinutes(startTime);
    const endM = timeToMinutes(endTime);
    if (startM >= endM) {
        const err = new Error('start_time must be before end_time');
        err.code = 'VALIDATION_ERROR';
        throw err;
    }
    const overlap = await hasOverlap(courtId, startTime, endTime, id);
    if (overlap) {
        const err = new Error('Activity time overlaps with another activity on this court');
        err.code = 'OVERLAP';
        throw err;
    }
    return prisma_1.prisma.activity.update({
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
async function deactivateActivity(id, academyId) {
    const activity = await getActivityById(id, academyId);
    if (!activity)
        return null;
    return prisma_1.prisma.activity.update({
        where: { id },
        data: { isActive: false },
        include: { court: { select: { id: true, name: true } } },
    });
}
//# sourceMappingURL=activityService.js.map