/*
  Warnings:

  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."EmploymentType" AS ENUM ('SPOT', 'REGULAR');

-- CreateEnum
CREATE TYPE "public"."SiteType" AS ENUM ('FULL', 'AM', 'PM');

-- CreateEnum
CREATE TYPE "public"."AvailabilityType" AS ENUM ('AVAILABLE_FULL', 'AVAILABLE_AM', 'AVAILABLE_PM', 'HOLIDAY_FULL', 'HOLIDAY_AM', 'HOLIDAY_PM');

-- CreateEnum
CREATE TYPE "public"."TimeSlot" AS ENUM ('AM', 'PM');

-- DropForeignKey
ALTER TABLE "public"."Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropTable
DROP TABLE "public"."Account";

-- DropTable
DROP TABLE "public"."User";

-- CreateTable
CREATE TABLE "public"."Staff" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "postalCode" TEXT,
    "address" TEXT,
    "emergencyName" TEXT NOT NULL,
    "emergencyPhone" TEXT NOT NULL,
    "bloodType" TEXT,
    "bloodPressure" TEXT,
    "lastCheckupDate" TIMESTAMP(3),
    "employmentType" "public"."EmploymentType" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "postalCode" TEXT,
    "address" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Sale" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Site" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "siteType" "public"."SiteType" NOT NULL,
    "managerName" TEXT,
    "managerPhone" TEXT,
    "postalCode" TEXT,
    "address" TEXT NOT NULL,
    "googleMapUrl" TEXT,
    "cancelled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "workContent" TEXT,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StaffAvailability" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "public"."AvailabilityType" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StaffAssignment" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "siteId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "timeSlot" "public"."TimeSlot" NOT NULL DEFAULT 'AM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExternalStaffAssignment" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "siteId" TEXT NOT NULL,
    "externalStaffName" TEXT NOT NULL,
    "externalStaffCompany" TEXT NOT NULL,
    "externalStaffNotes" TEXT,
    "timeSlot" "public"."TimeSlot" NOT NULL DEFAULT 'AM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalStaffAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "password" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InvoiceCheck" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "siteId" TEXT NOT NULL,
    "siteName" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "workContent" TEXT,
    "siteNotes" TEXT,
    "additionalText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvoiceCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Staff_email_key" ON "public"."Staff"("email");

-- CreateIndex
CREATE INDEX "Staff_name_idx" ON "public"."Staff"("name");

-- CreateIndex
CREATE INDEX "Staff_employmentType_idx" ON "public"."Staff"("employmentType");

-- CreateIndex
CREATE INDEX "Staff_createdAt_idx" ON "public"."Staff"("createdAt");

-- CreateIndex
CREATE INDEX "Staff_deleted_at_idx" ON "public"."Staff"("deleted_at");

-- CreateIndex
CREATE INDEX "Staff_name_employmentType_idx" ON "public"."Staff"("name", "employmentType");

-- CreateIndex
CREATE INDEX "Staff_employmentType_createdAt_idx" ON "public"."Staff"("employmentType", "createdAt");

-- CreateIndex
CREATE INDEX "Client_name_idx" ON "public"."Client"("name");

-- CreateIndex
CREATE INDEX "Sale_clientId_month_idx" ON "public"."Sale"("clientId", "month");

-- CreateIndex
CREATE INDEX "Sale_month_idx" ON "public"."Sale"("month");

-- CreateIndex
CREATE INDEX "Site_date_idx" ON "public"."Site"("date");

-- CreateIndex
CREATE INDEX "Site_clientId_idx" ON "public"."Site"("clientId");

-- CreateIndex
CREATE INDEX "Site_date_startTime_idx" ON "public"."Site"("date", "startTime");

-- CreateIndex
CREATE INDEX "Site_cancelled_idx" ON "public"."Site"("cancelled");

-- CreateIndex
CREATE INDEX "Site_date_cancelled_idx" ON "public"."Site"("date", "cancelled");

-- CreateIndex
CREATE INDEX "Site_clientId_date_idx" ON "public"."Site"("clientId", "date");

-- CreateIndex
CREATE INDEX "StaffAvailability_staffId_date_idx" ON "public"."StaffAvailability"("staffId", "date");

-- CreateIndex
CREATE INDEX "StaffAvailability_date_idx" ON "public"."StaffAvailability"("date");

-- CreateIndex
CREATE UNIQUE INDEX "StaffAvailability_staffId_date_key" ON "public"."StaffAvailability"("staffId", "date");

-- CreateIndex
CREATE INDEX "StaffAssignment_siteId_date_idx" ON "public"."StaffAssignment"("siteId", "date");

-- CreateIndex
CREATE INDEX "StaffAssignment_staffId_date_idx" ON "public"."StaffAssignment"("staffId", "date");

-- CreateIndex
CREATE INDEX "StaffAssignment_date_idx" ON "public"."StaffAssignment"("date");

-- CreateIndex
CREATE UNIQUE INDEX "StaffAssignment_siteId_staffId_date_timeSlot_key" ON "public"."StaffAssignment"("siteId", "staffId", "date", "timeSlot");

-- CreateIndex
CREATE INDEX "ExternalStaffAssignment_siteId_date_idx" ON "public"."ExternalStaffAssignment"("siteId", "date");

-- CreateIndex
CREATE INDEX "ExternalStaffAssignment_externalStaffName_date_idx" ON "public"."ExternalStaffAssignment"("externalStaffName", "date");

-- CreateIndex
CREATE INDEX "ExternalStaffAssignment_date_idx" ON "public"."ExternalStaffAssignment"("date");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalStaffAssignment_siteId_externalStaffName_date_timeS_key" ON "public"."ExternalStaffAssignment"("siteId", "externalStaffName", "date", "timeSlot");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "public"."user"("email");

-- CreateIndex
CREATE INDEX "InvoiceCheck_date_idx" ON "public"."InvoiceCheck"("date");

-- CreateIndex
CREATE INDEX "InvoiceCheck_siteId_idx" ON "public"."InvoiceCheck"("siteId");

-- CreateIndex
CREATE INDEX "InvoiceCheck_date_siteId_idx" ON "public"."InvoiceCheck"("date", "siteId");

-- AddForeignKey
ALTER TABLE "public"."Sale" ADD CONSTRAINT "Sale_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Site" ADD CONSTRAINT "Site_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StaffAvailability" ADD CONSTRAINT "StaffAvailability_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StaffAssignment" ADD CONSTRAINT "StaffAssignment_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "public"."Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StaffAssignment" ADD CONSTRAINT "StaffAssignment_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExternalStaffAssignment" ADD CONSTRAINT "ExternalStaffAssignment_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "public"."Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InvoiceCheck" ADD CONSTRAINT "InvoiceCheck_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "public"."Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;
