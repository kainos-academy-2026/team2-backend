-- Align schema to required table/column contract.

-- Remove legacy table from initial scaffold.
DROP TABLE IF EXISTS "JobRole" CASCADE;

-- Keep enum in known state.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'JobRoleStatus') THEN
    DROP TYPE "JobRoleStatus";
  END IF;
END $$;

CREATE TYPE "JobRoleStatus" AS ENUM ('OPEN', 'CLOSED');

CREATE TABLE "capability" (
  "capabilityId" SERIAL NOT NULL,
  "capabilityName" TEXT NOT NULL,
  CONSTRAINT "capability_pkey" PRIMARY KEY ("capabilityId")
);

CREATE TABLE "band" (
  "nameId" SERIAL NOT NULL,
  "bandName" TEXT NOT NULL,
  CONSTRAINT "band_pkey" PRIMARY KEY ("nameId")
);

CREATE TABLE "job-roles" (
  "jobRoleId" SERIAL NOT NULL,
  "roleName" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "capabilityId" INTEGER NOT NULL,
  "bandId" INTEGER NOT NULL,
  "closingDate" TIMESTAMP(3) NOT NULL,
  "status" "JobRoleStatus" NOT NULL DEFAULT 'OPEN',
  CONSTRAINT "job-roles_pkey" PRIMARY KEY ("jobRoleId")
);

ALTER TABLE "job-roles"
  ADD CONSTRAINT "job-roles_capabilityId_fkey"
  FOREIGN KEY ("capabilityId") REFERENCES "capability"("capabilityId") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "job-roles"
  ADD CONSTRAINT "job-roles_bandId_fkey"
  FOREIGN KEY ("bandId") REFERENCES "band"("nameId") ON DELETE RESTRICT ON UPDATE CASCADE;
