import { PaymentMethod } from '@prisma/client';
export interface RecordPaymentInput {
    academyId: string;
    billId: string;
    amount: number;
    paymentDate: Date;
    paymentMethod: PaymentMethod;
    notes?: string;
}
export declare function recordPayment(input: RecordPaymentInput): Promise<{
    payment: {
        academyId: string;
        id: string;
        createdAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        paymentDate: Date;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        notes: string | null;
        billId: string;
    };
    bill: {
        status: import("../utils/billStatus").BillStatus;
        amount: unknown;
        totalPaid: unknown;
        periodStart: Date;
    } | null;
}>;
//# sourceMappingURL=paymentService.d.ts.map