import { Decimal } from '@prisma/client/runtime/library';
export type BillStatus = 'PAID' | 'UPCOMING' | 'DUE' | 'OVERDUE';
export interface BillForStatus {
    amount: Decimal | number;
    totalPaid: Decimal | number;
    periodStart: Date;
}
/** Derive bill status from amount, total_paid, period_start and optional reference date (default today) */
export declare function deriveBillStatus(bill: BillForStatus, referenceDate?: Date): BillStatus;
//# sourceMappingURL=billStatus.d.ts.map