-- CreateTable
CREATE TABLE "JobRole" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "capability" TEXT,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobRole_pkey" PRIMARY KEY ("id")
);
