import { JobRoleStatus } from "@prisma/client";
import prisma from "../prismaClient.js";
import type { JobRole } from "../models/jobRole.js";

export class JobRoleDao {
  async findOpenJobRoles(): Promise<JobRole[]> {
    return prisma.jobRole.findMany({
      where: {
        status: JobRoleStatus.OPEN,
      },
      include: {
        capability: true,
        band: true,
      },
      orderBy: {
        closingDate: "asc",
      },
    });
  }
}