import { describe, expect, it } from "vitest";
import { JobRoleMapper } from "../../src/mappers/jobRoleMapper.js";
import { makeJobRole } from "../fixtures/jobRoleFixtures.js";

describe("JobRoleMapper.toResponse", () => {
	it("maps a JobRole to the public response shape", () => {
		const closingDate = new Date("2026-08-31T00:00:00.000Z");
		const jobRole = makeJobRole({
			jobRoleId: 7,
			roleName: "QA Engineer",
			location: "Galway",
			capability: { capabilityName: "Quality" },
			band: { bandName: "Band 3" },
			closingDate,
			status: "OPEN",
			description: "Test software thoroughly.",
			responsibilities: ["Write test cases, execute tests, report bugs."],
			sharepointUrl: "https://example.com/job-role-qa",
			numberOfOpenPositions: 2,
		});

		const mapper = new JobRoleMapper();
		const result = mapper.toResponse(jobRole);

		expect(result).toEqual({
			jobRoleId: 7,
			roleName: "QA Engineer",
			location: "Galway",
			capability: "Quality",
			band: "Band 3",
			closingDate: closingDate.toISOString(),
			status: "OPEN",
			description: "Test software thoroughly.",
			responsibilities: ["Write test cases, execute tests, report bugs."],
			sharepointUrl: "https://example.com/job-role-qa",
			numberOfOpenPositions: 2,
		});
	});
});
