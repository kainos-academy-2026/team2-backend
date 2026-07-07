import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, JobRoleStatus } from "@prisma/client";
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
}
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
async function main() {
    const engineering = await prisma.capability.upsert({
        where: { capabilityId: 1 },
        update: {},
        create: {
            capabilityName: "Engineering",
        },
    });
    const consulting = await prisma.capability.upsert({
        where: { capabilityId: 2 },
        update: {},
        create: {
            capabilityName: "Consulting",
        },
    });
    const band2 = await prisma.band.upsert({
        where: { nameId: 1 },
        update: {},
        create: {
            bandName: "Band 2",
        },
    });
    const band3 = await prisma.band.upsert({
        where: { nameId: 2 },
        update: {},
        create: {
            bandName: "Band 3",
        },
    });
    await prisma.jobRole.createMany({
        data: [
            {
                roleName: "Software Engineer",
                location: "Belfast",
                capabilityId: engineering.capabilityId,
                bandId: band2.nameId,
                closingDate: new Date("2026-08-15T00:00:00.000Z"),
                status: JobRoleStatus.OPEN,
            },
            {
                roleName: "Platform Engineer",
                location: "Dublin",
                capabilityId: engineering.capabilityId,
                bandId: band3.nameId,
                closingDate: new Date("2026-09-01T00:00:00.000Z"),
                status: JobRoleStatus.OPEN,
            },
            {
                roleName: "Business Analyst",
                location: "London",
                capabilityId: consulting.capabilityId,
                bandId: band2.nameId,
                closingDate: new Date("2026-07-01T00:00:00.000Z"),
                status: JobRoleStatus.CLOSED,
            },
        ],
        skipDuplicates: true,
    });
}
main()
    .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map