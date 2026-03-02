-- CreateTable
CREATE TABLE "courts" (
    "id" TEXT NOT NULL,
    "academy_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "courts_academy_id_idx" ON "courts"("academy_id");

-- AddForeignKey
ALTER TABLE "courts" ADD CONSTRAINT "courts_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "Academy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
