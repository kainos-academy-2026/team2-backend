import { JobRoleStatus } from "@prisma/client";
import type { JobRole } from "../../src/models/jobRole.js";

export const makeJobRole = (overrides: Partial<JobRole> = {}): JobRole => ({
	jobRoleId: 1,
	roleName: "Software Engineer",
	location: "Dublin",
	capabilityId: 10,
	bandId: 20,
	closingDate: new Date("2026-08-01T00:00:00.000Z"),
	status: JobRoleStatus.OPEN,
	capability: {
		capabilityId: 10,
		capabilityName: "Engineering",
	},
	band: {
		nameId: 20,
		bandName: "Band 2",
	},
	...overrides,
});
