import * as jose from "jose";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFindAllOpen = vi.fn();
const mockFindById = vi.fn();
const mockCreateJobRole = vi.fn();

vi.mock("../../src/services/jobRoleService.js", () => ({
	JobRoleService: class {
		async findAllOpen() {
			return mockFindAllOpen();
		}
		async findById() {
			return mockFindById();
		}
		async createJobRole() {
			return mockCreateJobRole();
		}
		async getBands() {
			return [];
		}
		async getCapabilities() {
			return [];
		}
		async deleteRole() {}
	},
}));

import { app } from "../../src/app.js";

const TEST_SECRET = "test-secret-key";

const generateToken = async (role: "user" | "admin"): Promise<string> => {
	const secretKey = new TextEncoder().encode(TEST_SECRET);
	return new jose.SignJWT({
		sub: "test-user-id",
		name: "Test User",
		email: "test@example.com",
		role,
	})
		.setProtectedHeader({ alg: "HS256" })
		.setExpirationTime("2h")
		.sign(secretKey);
};

describe("Job Roles API", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe("GET /job-roles", () => {
		it("returns 401 when no auth token is provided", async () => {
			const response = await request(app).get("/job-roles");

			expect(response.status).toBe(401);
			expect(response.body).toEqual({ message: "Unauthorized" });
		});

		it("returns 200 with job roles for an authenticated user", async () => {
			const token = await generateToken("user");
			const roles = [
				{
					id: "role-1",
					roleName: "Platform Engineer",
					location: "Dublin",
					capability: "Engineering",
					band: "Band 2",
					closingDate: "2026-08-01T00:00:00.000Z",
					status: "OPEN",
					numberOfOpenPositions: 3,
				},
			];
			mockFindAllOpen.mockResolvedValue(roles);

			const response = await request(app)
				.get("/job-roles")
				.set("Authorization", `Bearer ${token}`);

			expect(response.status).toBe(200);
			expect(response.body).toEqual(roles);
		});

		it("returns 200 with an empty array when no open roles exist", async () => {
			const token = await generateToken("user");
			mockFindAllOpen.mockResolvedValue([]);

			const response = await request(app)
				.get("/job-roles")
				.set("Authorization", `Bearer ${token}`);

			expect(response.status).toBe(200);
			expect(response.body).toEqual([]);
		});
	});

	describe("GET /job-roles/:id", () => {
		it("returns 200 with the job role when found", async () => {
			const token = await generateToken("user");
			const role = {
				id: "42",
				roleName: "Software Engineer",
				location: "Belfast",
				capability: "Engineering",
				band: "Band 3",
				closingDate: "2026-09-01T00:00:00.000Z",
				status: "OPEN",
				numberOfOpenPositions: 1,
			};
			mockFindById.mockResolvedValue(role);

			const response = await request(app)
				.get("/job-roles/42")
				.set("Authorization", `Bearer ${token}`);

			expect(response.status).toBe(200);
			expect(response.body).toEqual(role);
		});

		it("returns 404 when the job role does not exist", async () => {
			const token = await generateToken("user");
			mockFindById.mockResolvedValue(null);

			const response = await request(app)
				.get("/job-roles/999")
				.set("Authorization", `Bearer ${token}`);

			expect(response.status).toBe(404);
			expect(response.body).toEqual({ message: "Job role not found" });
		});
	});

	describe("POST /job-roles", () => {
		const validRoleBody = {
			name: "Graduate Engineer",
			location: "Dublin",
			capabilityId: 1,
			bandId: 2,
			closingDate: "2026-12-01",
			description: "A graduate engineering role",
			sharepointUrl: "https://example.com/role/1",
			responsibilities: ["Write code", "Review PRs"],
			numberOfOpenPositions: 2,
		};

		it("returns 403 when a non-admin user tries to create a job role", async () => {
			const token = await generateToken("user");

			const response = await request(app)
				.post("/job-roles")
				.set("Authorization", `Bearer ${token}`)
				.send(validRoleBody);

			expect(response.status).toBe(403);
			expect(response.body).toEqual({ message: "Forbidden" });
		});

		it("returns 400 when required fields are missing", async () => {
			const token = await generateToken("admin");

			const response = await request(app)
				.post("/job-roles")
				.set("Authorization", `Bearer ${token}`)
				.send({ location: "Dublin" });

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty("message");
			expect(mockCreateJobRole).not.toHaveBeenCalled();
		});

		it("returns 201 when an admin creates a valid job role", async () => {
			const token = await generateToken("admin");
			mockCreateJobRole.mockResolvedValue({
				id: "new-role-id",
				...validRoleBody,
			});

			const response = await request(app)
				.post("/job-roles")
				.set("Authorization", `Bearer ${token}`)
				.send(validRoleBody);

			expect(response.status).toBe(201);
		});
	});
});
