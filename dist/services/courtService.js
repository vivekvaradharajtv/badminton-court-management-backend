"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCourtSlots = getCourtSlots;
exports.createCourt = createCourt;
exports.listCourts = listCourts;
exports.getCourtById = getCourtById;
exports.updateCourt = updateCourt;
const prisma_1 = require("../lib/prisma");
const academyService = __importStar(require("./academyService"));
const DEFAULT_OPENING = '06:00';
const DEFAULT_CLOSING = '22:00';
const DEFAULT_SLOT_MINS = 60;
/** Parse "HH:mm" or "H:mm" to minutes since midnight */
function timeToMinutes(t) {
    const [h, m] = t.trim().split(':').map((s) => parseInt(s, 10));
    return (h ?? 0) * 60 + (m ?? 0);
}
/** Minutes since midnight to "HH:mm" */
function minutesToTime(mins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}
async function getCourtSlots(courtId, academyId, date) {
    const court = await getCourtById(courtId, academyId);
    if (!court)
        return null;
    const settings = await academyService.getAcademySettings(academyId);
    const opening = settings?.opening_time ?? DEFAULT_OPENING;
    const closing = settings?.closing_time ?? DEFAULT_CLOSING;
    const slotMins = settings?.slot_duration ?? DEFAULT_SLOT_MINS;
    const openMins = timeToMinutes(opening);
    const closeMins = timeToMinutes(closing);
    const d = date ?? new Date();
    const dayOfWeek = d.getDay(); // 0=Sun, 1=Mon, ... 6=Sat
    const activities = await prisma_1.prisma.activity.findMany({
        where: { courtId, academyId, isActive: true },
        select: { id: true, name: true, startTime: true, endTime: true, recurrenceDays: true },
    });
    const activitiesOnThisDay = activities.filter((a) => a.recurrenceDays.includes(dayOfWeek));
    const slots = [];
    for (let m = openMins; m + slotMins <= closeMins; m += slotMins) {
        const slotStart = m;
        const slotEnd = m + slotMins;
        let activity = null;
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
        });
    }
    const dateStr = d.toISOString().slice(0, 10);
    return {
        court: { id: court.id, name: court.name },
        date: dateStr,
        slots,
    };
}
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