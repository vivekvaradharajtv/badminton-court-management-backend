import { Decimal } from '@prisma/client/runtime/library';

export type BillStatus = 'PAID' | 'UPCOMING' | 'DUE' | 'OVERDUE';

export interface BillForStatus {
  amount: Decimal | number;
  totalPaid: Decimal | number;
  periodStart: Date;
}

/** Derive bill status from amount, total_paid, period_start and optional reference date (default today) */
export function deriveBillStatus(
  bill: BillForStatus,
  referenceDate: Date = new Date()
): BillStatus {
  const amount = typeof bill.amount === 'number' ? bill.amount : Number(bill.amount);
  const totalPaid = typeof bill.totalPaid === 'number' ? bill.totalPaid : Number(bill.totalPaid);
  const start = new Date(bill.periodStart);
  start.setHours(0, 0, 0, 0);
  const ref = new Date(referenceDate);
  ref.setHours(0, 0, 0, 0);

  if (totalPaid >= amount) return 'PAID';
  if (ref < start) return 'UPCOMING';

  const graceEnd = new Date(start);
  graceEnd.setDate(graceEnd.getDate() + 5);
  if (ref <= graceEnd) return 'DUE';
  return 'OVERDUE';
}
