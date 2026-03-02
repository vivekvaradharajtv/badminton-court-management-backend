-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'UPI', 'BANK', 'OTHER');

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "academy_id" TEXT NOT NULL,
    "court_id" TEXT NOT NULL,
    "name" TEXT,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "monthly_fee" DECIMAL(10,2) NOT NULL,
    "max_players" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_members" (
    "id" TEXT NOT NULL,
    "academy_id" TEXT NOT NULL,
    "activity_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "is_captain" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bills" (
    "id" TEXT NOT NULL,
    "academy_id" TEXT NOT NULL,
    "activity_id" TEXT NOT NULL,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "total_paid" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "academy_id" TEXT NOT NULL,
    "bill_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_date" DATE NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activities_academy_id_idx" ON "activities"("academy_id");
CREATE INDEX "activities_court_id_idx" ON "activities"("court_id");

-- CreateIndex
CREATE INDEX "activity_members_academy_id_idx" ON "activity_members"("academy_id");
CREATE INDEX "activity_members_activity_id_idx" ON "activity_members"("activity_id");

-- CreateIndex
CREATE INDEX "bills_academy_id_idx" ON "bills"("academy_id");
CREATE INDEX "bills_activity_id_idx" ON "bills"("activity_id");
CREATE INDEX "bills_period_start_idx" ON "bills"("period_start");

-- CreateIndex
CREATE INDEX "payments_academy_id_idx" ON "payments"("academy_id");
CREATE INDEX "payments_bill_id_idx" ON "payments"("bill_id");

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "Academy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "activities" ADD CONSTRAINT "activities_court_id_fkey" FOREIGN KEY ("court_id") REFERENCES "courts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_members" ADD CONSTRAINT "activity_members_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "Academy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "activity_members" ADD CONSTRAINT "activity_members_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "Academy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "bills" ADD CONSTRAINT "bills_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "Academy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills"("id") ON DELETE CASCADE ON UPDATE CASCADE;
