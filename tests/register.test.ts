import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockRegister } = vi.hoisted(() => ({
	mockRegister: vi.fn(),
}));

vi.mock("../src/controllers/registerUserController.js", () => {
	return {
		RegisterUserController: class {
			register = mockRegister;
		},
	};
});

import { app } from "../src/app.js";

describe("POST /register", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("creates an account when fullName, email and password are valid", async () => {
		mockRegister.mockImplementation(async (_req, res) => {
			res.status(201).json({ message: "Account created successfully" });
		});

		const response = await request(app).post("/register").send({
			fullName: "Test User",
			email: "test.user@example.com",
			password: "Strong!Pass9",
		});

		expect(response.status).toBe(201);
		expect(response.body).toEqual({ message: "Account created successfully" });
		expect(mockRegister).toHaveBeenCalledTimes(1);
	});

	it("rejects invalid email format", async () => {
		const response = await request(app).post("/register").send({
			fullName: "Test User",
			email: "not-an-email",
			password: "Strong!Pass9",
		});

		expect(response.status).toBe(400);
		expect(response.body.message).toBe("Invalid email format");
		expect(mockRegister).not.toHaveBeenCalled();
	});

	it("rejects weak passwords", async () => {
		const response = await request(app).post("/register").send({
			fullName: "Test User",
			email: "test.user@example.com",
			password: "weakpass",
		});

		expect(response.status).toBe(400);
		expect(response.body.message).toContain(
			"Password must be at least 9 characters",
		);
		expect(mockRegister).not.toHaveBeenCalled();
	});

	it("returns controller response when validation passes", async () => {
		mockRegister.mockImplementation(async (_req, res) => {
			res.status(409).json({ message: "Email already exists" });
		});

		const response = await request(app).post("/register").send({
			fullName: "Test User",
			email: "test.user@example.com",
			password: "Strong!Pass9",
		});

		expect(response.status).toBe(409);
		expect(response.body).toEqual({ message: "Email already exists" });
		expect(mockRegister).toHaveBeenCalledTimes(1);
	});
});
