"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordPayment = recordPayment;
const prisma_1 = require("../lib/prisma");
const billService_1 = require("./billService");
async function recordPayment(input) {
    if (input.amount <= 0) {
        const err = new Error('Amount must be greater than 0');
        err.code = 'VALIDATION_ERROR';
        throw err;
    }
    const bill = await prisma_1.prisma.bill.findFirst({
        where: { id: input.billId, academyId: input.academyId },
    });
    if (!bill) {
        const err = new Error('Bill not found');
        err.code = 'NOT_FOUND';
        throw err;
    }
    const amountNum = Number(bill.amount);
    const totalPaidNum = Number(bill.totalPaid);
    const remaining = amountNum - totalPaidNum;
    if (input.amount > remaining) {
        const err = new Error('Payment amount exceeds remaining balance');
        err.code = 'VALIDATION_ERROR';
        throw err;
    }
    const payment = await prisma_1.prisma.payment.create({
        data: {
            academyId: input.academyId,
            billId: input.billId,
            amount: input.amount,
            paymentDate: input.paymentDate,
            paymentMethod: input.paymentMethod,
            notes: input.notes ?? null,
        },
    });
    const newTotalPaid = totalPaidNum + input.amount;
    await prisma_1.prisma.bill.update({
        where: { id: input.billId },
        data: { totalPaid: newTotalPaid },
    });
    const updatedBill = await prisma_1.prisma.bill.findUnique({
        where: { id: input.billId },
        include: { activity: { select: { id: true, name: true } } },
    });
    const billWithStatus = updatedBill
        ? (0, billService_1.getBillWithStatus)(updatedBill)
        : null;
    return { payment, bill: billWithStatus };
}
//# sourceMappingURL=paymentService.js.map