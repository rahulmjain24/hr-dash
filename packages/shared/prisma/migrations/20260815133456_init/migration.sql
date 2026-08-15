-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'INTERVIEWING', 'REJECTED', 'HIRED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('RESUME', 'COVER_LETTER', 'OTHER');

-- CreateTable
CREATE TABLE "tbl_users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_departments" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_job_listings" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "department_id" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_job_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_application_forms" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "job_id" INTEGER NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "additional_properties" JSONB,
    "submission_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_application_forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_documents" (
    "id" SERIAL NOT NULL,
    "application_id" INTEGER NOT NULL,
    "document_type" "DocumentType" NOT NULL,
    "link" TEXT NOT NULL,
    "meta" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_application_status_history" (
    "id" SERIAL NOT NULL,
    "application_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "old_status" "JobStatus",
    "new_status" "JobStatus" NOT NULL,
    "remarks" TEXT,

    CONSTRAINT "tbl_application_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_interviews" (
    "id" SERIAL NOT NULL,
    "application_id" INTEGER NOT NULL,
    "interviewer_user_id" INTEGER NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "meeting_link" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_interviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_users_email_key" ON "tbl_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_departments_name_key" ON "tbl_departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_application_forms_email_job_id_key" ON "tbl_application_forms"("email", "job_id");

-- AddForeignKey
ALTER TABLE "tbl_job_listings" ADD CONSTRAINT "tbl_job_listings_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "tbl_departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_application_forms" ADD CONSTRAINT "tbl_application_forms_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "tbl_job_listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_documents" ADD CONSTRAINT "tbl_documents_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "tbl_application_forms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_application_status_history" ADD CONSTRAINT "tbl_application_status_history_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "tbl_application_forms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_application_status_history" ADD CONSTRAINT "tbl_application_status_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tbl_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_interviews" ADD CONSTRAINT "tbl_interviews_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "tbl_application_forms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_interviews" ADD CONSTRAINT "tbl_interviews_interviewer_user_id_fkey" FOREIGN KEY ("interviewer_user_id") REFERENCES "tbl_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
