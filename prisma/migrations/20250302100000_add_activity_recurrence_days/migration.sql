-- AlterTable
ALTER TABLE "activities" ADD COLUMN "recurrence_days" INTEGER[] NOT NULL DEFAULT ARRAY[0, 1, 2, 3, 4, 5, 6];
