"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deriveBillStatus = deriveBillStatus;
/** Derive bill status from amount, total_paid, period_start and optional reference date (default today) */
function deriveBillStatus(bill, referenceDate = new Date()) {
    const amount = typeof bill.amount === 'number' ? bill.amount : Number(bill.amount);
    const totalPaid = typeof bill.totalPaid === 'number' ? bill.totalPaid : Number(bill.totalPaid);
    const start = new Date(bill.periodStart);
    start.setHours(0, 0, 0, 0);
    const ref = new Date(referenceDate);
    ref.setHours(0, 0, 0, 0);
    if (totalPaid >= amount)
        return 'PAID';
    if (ref < start)
        return 'UPCOMING';
    const graceEnd = new Date(start);
    graceEnd.setDate(graceEnd.getDate() + 5);
    if (ref <= graceEnd)
        return 'DUE';
    return 'OVERDUE';
}
//# sourceMappingURL=billStatus.js.map