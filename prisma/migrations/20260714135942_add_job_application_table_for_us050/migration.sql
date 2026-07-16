-- CreateTable
CREATE TABLE "JobApplication" (
    "applicationId" SERIAL NOT NULL,
    "jobRoleId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "cvUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("applicationId")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobApplication_jobRoleId_userId_key" ON "JobApplication"("jobRoleId", "userId");
