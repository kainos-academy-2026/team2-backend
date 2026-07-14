import type { JobRole } from "../../src/models/jobRole.js";

type JobRoleWithIds = JobRole & { capabilityId: number; bandId: number };

export const makeJobRole = (
	overrides: Partial<JobRoleWithIds> = {},
): JobRoleWithIds => ({
	jobRoleId: 1,
	roleName: "Software Engineer",
	location: "Dublin",
	capability: {
		capabilityName: "Engineering",
	},
	band: {
		bandName: "Band 2",
	},
	closingDate: new Date("2026-08-01T00:00:00.000Z"),
	status: "OPEN",
	description: "Build and maintain services.",
	responsibilities: ["Write code, review code, deploy code."],
	sharepointUrl: "https://example.com/job-role",
	numberOfOpenPositions: 3,
	capabilityId: 1,
	bandId: 1,
	...overrides,
});
