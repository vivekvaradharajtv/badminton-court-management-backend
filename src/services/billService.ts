import { prisma } from '../lib/prisma';
import { deriveBillStatus, type BillStatus } from '../utils/billStatus';

/** Add n months to a date (anchor), then set to first day of that month */
function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Last day of the month containing d */
function endOfMonth(d: Date): Date {
  const e = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  e.setHours(0, 0, 0, 0);
  return e;
}

/** Ensure bills exist for an activity up to today (lazy generation). */
export async function ensureBillsForActivity(activityId: string, academyId: string): Promise<void> {
  const activity = await prisma.activity.findFirst({
    where: { id: activityId, academyId },
  });
  if (!activity || !activity.isActive) return;

  const anchor = new Date(activity.startDate);
  anchor.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let n = 0;
  for (;;) {
    const periodStart = addMonths(anchor, n);
    if (periodStart > today) break;
    const periodEnd = endOfMonth(periodStart);

    const existing = await prisma.bill.findFirst({
      where: {
        activityId,
        academyId,
        periodStart,
      },
    });
    if (!existing) {
      await prisma.bill.create({
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

export interface ListBillsOptions {
  academyId: string;
  activityId?: string;
  status?: BillStatus;
  limit?: number;
  offset?: number;
}

export async function listBills(options: ListBillsOptions) {
  const { academyId, activityId, status, limit = 50, offset = 0 } = options;
  const where: { academyId: string; activityId?: string } = { academyId };
  if (activityId) where.activityId = activityId;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const bills = await prisma.bill.findMany({
    where,
    orderBy: [{ periodStart: 'desc' }],
    take: status ? 500 : Math.min(limit, 100),
    skip: status ? 0 : offset,
    include: { activity: { select: { id: true, name: true } } },
  });

  let withStatus = bills.map((b) => ({
    ...b,
    status: deriveBillStatus(
      { amount: b.amount, totalPaid: b.totalPaid, periodStart: b.periodStart },
      today
    ) as BillStatus,
  }));

  if (status) {
    withStatus = withStatus.filter((b) => b.status === status);
    const total = withStatus.length;
    withStatus = withStatus.slice(offset, offset + limit);
    return { bills: withStatus, total };
  }

  const total = await prisma.bill.count({ where });
  return { bills: withStatus, total };
}

export function getBillWithStatus(bill: {
  amount: unknown;
  totalPaid: unknown;
  periodStart: Date;
}) {
  const status = deriveBillStatus(
    {
      amount: bill.amount as number,
      totalPaid: bill.totalPaid as number,
      periodStart: bill.periodStart,
    },
    new Date()
  );
  return { ...bill, status };
}
