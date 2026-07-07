import { describe, expect, it } from "vitest";
import { JobRoleMapper } from "../../src/mappers/jobRoleMapper.js";
import { makeJobRole } from "../fixtures/jobRoleFixtures.js";

describe("JobRoleMapper.toResponse", () => {
	it("maps a JobRole to the public response shape", () => {
		const closingDate = new Date("2026-08-31T00:00:00.000Z");
		const jobRole = makeJobRole({
			roleName: "QA Engineer",
			location: "Galway",
			closingDate,
			capability: { capabilityId: 33, capabilityName: "Quality" },
			band: { nameId: 44, bandName: "Band 3" },
		});

		const mapper = new JobRoleMapper();
		const result = mapper.toResponse(jobRole);

		expect(result).toEqual({
			roleName: "QA Engineer",
			location: "Galway",
			capability: "Quality",
			band: "Band 3",
			closingDate,
		});
	});
});
