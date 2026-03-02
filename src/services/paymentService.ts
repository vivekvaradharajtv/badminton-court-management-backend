import { prisma } from '../lib/prisma';
import { PaymentMethod } from '@prisma/client';
import { getBillWithStatus } from './billService';

export interface RecordPaymentInput {
  academyId: string;
  billId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export async function recordPayment(input: RecordPaymentInput) {
  if (input.amount <= 0) {
    const err = new Error('Amount must be greater than 0');
    (err as Error & { code?: string }).code = 'VALIDATION_ERROR';
    throw err;
  }

  const bill = await prisma.bill.findFirst({
    where: { id: input.billId, academyId: input.academyId },
  });
  if (!bill) {
    const err = new Error('Bill not found');
    (err as Error & { code?: string }).code = 'NOT_FOUND';
    throw err;
  }

  const amountNum = Number(bill.amount);
  const totalPaidNum = Number(bill.totalPaid);
  const remaining = amountNum - totalPaidNum;
  if (input.amount > remaining) {
    const err = new Error('Payment amount exceeds remaining balance');
    (err as Error & { code?: string }).code = 'VALIDATION_ERROR';
    throw err;
  }

  const payment = await prisma.payment.create({
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
  await prisma.bill.update({
    where: { id: input.billId },
    data: { totalPaid: newTotalPaid },
  });

  const updatedBill = await prisma.bill.findUnique({
    where: { id: input.billId },
    include: { activity: { select: { id: true, name: true } } },
  });
  const billWithStatus = updatedBill
    ? getBillWithStatus(updatedBill)
    : null;

  return { payment, bill: billWithStatus };
}
