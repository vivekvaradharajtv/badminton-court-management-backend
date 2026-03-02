import { type BillStatus } from '../utils/billStatus';
/** Ensure bills exist for an activity up to today (lazy generation). */
export declare function ensureBillsForActivity(activityId: string, academyId: string): Promise<void>;
export interface ListBillsOptions {
    academyId: string;
    activityId?: string;
    status?: BillStatus;
    limit?: number;
    offset?: number;
}
export declare function listBills(options: ListBillsOptions): Promise<{
    bills: {
        status: BillStatus;
        activity: {
            id: string;
            name: string | null;
        };
        academyId: string;
        id: string;
        createdAt: Date;
        activityId: string;
        periodStart: Date;
        periodEnd: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        totalPaid: import("@prisma/client/runtime/library").Decimal;
    }[];
    total: number;
}>;
export declare function getBillWithStatus(bill: {
    amount: unknown;
    totalPaid: unknown;
    periodStart: Date;
}): {
    status: BillStatus;
    amount: unknown;
    totalPaid: unknown;
    periodStart: Date;
};
//# sourceMappingURL=billService.d.ts.map