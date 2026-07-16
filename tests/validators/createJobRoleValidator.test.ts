import { describe, expect, it } from "vitest";
import createJobRoleSchema from "../../src/validators/createJobRoleValidator.js";

describe("createJobRoleSchema", () => {
	const validPayload = {
		name: "Technical Architect",
		location: "Belfast",
		capabilityId: 1,
		bandId: 2,
		closingDate: "2026-12-31",
	};

	it("accepts a valid minimal payload", () => {
		const result = createJobRoleSchema.safeParse(validPayload);

		expect(result.success).toBe(true);
	});

	it("accepts a fully populated valid payload", () => {
		const result = createJobRoleSchema.safeParse({
			...validPayload,
			description: "Build architecture solutions",
			sharepointUrl: "https://example.com/spec",
			responsibilities: ["Design systems", "Lead teams"],
			numberOfOpenPositions: 3,
		});

		expect(result.success).toBe(true);
	});

	it("sets defaults for optional fields when omitted", () => {
		const result = createJobRoleSchema.safeParse(validPayload);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.description).toBe("");
			expect(result.data.sharepointUrl).toBe("");
			expect(result.data.responsibilities).toEqual([]);
			expect(result.data.numberOfOpenPositions).toBe(0);
		}
	});

	it("fails when name is missing", () => {
		const result = createJobRoleSchema.safeParse({
			...validPayload,
			name: undefined,
		});

		expect(result.success).toBe(false);
	});

	it("fails when name is empty", () => {
		const result = createJobRoleSchema.safeParse({
			...validPayload,
			name: "",
		});

		expect(result.success).toBe(false);
	});

	it("fails when location is missing", () => {
		const result = createJobRoleSchema.safeParse({
			...validPayload,
			location: undefined,
		});

		expect(result.success).toBe(false);
	});

	it("fails when capabilityId is missing", () => {
		const result = createJobRoleSchema.safeParse({
			...validPayload,
			capabilityId: undefined,
		});

		expect(result.success).toBe(false);
	});

	it("fails when bandId is missing", () => {
		const result = createJobRoleSchema.safeParse({
			...validPayload,
			bandId: undefined,
		});

		expect(result.success).toBe(false);
	});

	it("fails when capabilityId is not a positive integer", () => {
		const result = createJobRoleSchema.safeParse({
			...validPayload,
			capabilityId: 0,
		});

		expect(result.success).toBe(false);
	});

	it("fails when bandId is not a positive integer", () => {
		const result = createJobRoleSchema.safeParse({
			...validPayload,
			bandId: -1,
		});

		expect(result.success).toBe(false);
	});

	it("fails when closingDate is missing", () => {
		const result = createJobRoleSchema.safeParse({
			...validPayload,
			closingDate: undefined,
		});

		expect(result.success).toBe(false);
	});

	it("fails when closingDate is not a valid date format", () => {
		const result = createJobRoleSchema.safeParse({
			...validPayload,
			closingDate: "31-12-2026",
		});

		expect(result.success).toBe(false);
	});

	it("fails when numberOfOpenPositions is negative", () => {
		const result = createJobRoleSchema.safeParse({
			...validPayload,
			numberOfOpenPositions: -1,
		});

		expect(result.success).toBe(false);
	});
});
