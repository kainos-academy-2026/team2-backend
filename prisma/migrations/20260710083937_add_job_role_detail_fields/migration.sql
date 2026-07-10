-- AlterTable
ALTER TABLE "JobRole" ADD COLUMN     "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "numberOfOpenPositions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "responsibilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "sharepointUrl" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
