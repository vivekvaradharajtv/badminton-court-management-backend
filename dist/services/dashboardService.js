"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardSummary = getDashboardSummary;
const prisma_1 = require("../lib/prisma");
const billStatus_1 = require("../utils/billStatus");
async function getDashboardSummary(academyId) {
    const bills = await prisma_1.prisma.bill.findMany({
        where: { academyId },
        select: { amount: true, totalPaid: true, periodStart: true },
    });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let totalExpected = 0;
    let totalCollected = 0;
    let totalOutstanding = 0;
    let overdueCount = 0;
    let dueCount = 0;
    for (const b of bills) {
        const amount = Number(b.amount);
        const paid = Number(b.totalPaid);
        const status = (0, billStatus_1.deriveBillStatus)({ amount: b.amount, totalPaid: b.totalPaid, periodStart: b.periodStart }, today);
        totalExpected += amount;
        totalCollected += paid;
        if (status !== 'PAID') {
            totalOutstanding += amount - paid;
            if (status === 'OVERDUE')
                overdueCount += 1;
            else if (status === 'DUE')
                dueCount += 1;
        }
    }
    const collectionPercentage = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100 * 100) / 100 : 0;
    return {
        total_expected_revenue: Math.round(totalExpected * 100) / 100,
        total_collected: Math.round(totalCollected * 100) / 100,
        total_outstanding: Math.round(totalOutstanding * 100) / 100,
        collection_percentage: collectionPercentage,
        overdue_count: overdueCount,
        due_count: dueCount,
    };
}
//# sourceMappingURL=dashboardService.js.map