"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureBillsForActivity = ensureBillsForActivity;
exports.listBills = listBills;
exports.getBillWithStatus = getBillWithStatus;
const prisma_1 = require("../lib/prisma");
const billStatus_1 = require("../utils/billStatus");
/** Add n months to a date (anchor), then set to first day of that month */
function addMonths(date, n) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + n);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
}
/** Last day of the month containing d */
function endOfMonth(d) {
    const e = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    e.setHours(0, 0, 0, 0);
    return e;
}
/** Ensure bills exist for an activity up to today (lazy generation). */
async function ensureBillsForActivity(activityId, academyId) {
    const activity = await prisma_1.prisma.activity.findFirst({
        where: { id: activityId, academyId },
    });
    if (!activity || !activity.isActive)
        return;
    const anchor = new Date(activity.startDate);
    anchor.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let n = 0;
    for (;;) {
        const periodStart = addMonths(anchor, n);
        if (periodStart > today)
            break;
        const periodEnd = endOfMonth(periodStart);
        const existing = await prisma_1.prisma.bill.findFirst({
            where: {
                activityId,
                academyId,
                periodStart,
            },
        });
        if (!existing) {
            await prisma_1.prisma.bill.create({
                data: {
                    academyId,
                    activityId,
                    periodStart,
                    periodEnd,
                    amount: activity.monthlyFee,
                    totalPaid: 0,
                },
            });
        }
        n += 1;
    }
}
async function listBills(options) {
    const { academyId, activityId, status, limit = 50, offset = 0 } = options;
    const where = { academyId };
    if (activityId)
        where.activityId = activityId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bills = await prisma_1.prisma.bill.findMany({
        where,
        orderBy: [{ periodStart: 'desc' }],
        take: status ? 500 : Math.min(limit, 100),
        skip: status ? 0 : offset,
        include: { activity: { select: { id: true, name: true } } },
    });
    let withStatus = bills.map((b) => ({
        ...b,
        status: (0, billStatus_1.deriveBillStatus)({ amount: b.amount, totalPaid: b.totalPaid, periodStart: b.periodStart }, today),
    }));
    if (status) {
        withStatus = withStatus.filter((b) => b.status === status);
        const total = withStatus.length;
        withStatus = withStatus.slice(offset, offset + limit);
        return { bills: withStatus, total };
    }
    const total = await prisma_1.prisma.bill.count({ where });
    return { bills: withStatus, total };
}
function getBillWithStatus(bill) {
    const status = (0, billStatus_1.deriveBillStatus)({
        amount: bill.amount,
        totalPaid: bill.totalPaid,
        periodStart: bill.periodStart,
    }, new Date());
    return { ...bill, status };
}
//# sourceMappingURL=billService.js.map