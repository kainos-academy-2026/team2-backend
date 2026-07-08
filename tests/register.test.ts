import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RegisterUserController } from "../src/controllers/registerUserController.js";
import { DuplicateUserEmailError } from "../src/errors/userErrors.js";
import { createRegisterRouter } from "../src/routes/register.js";

const mockRegisterUser = vi.fn();

const app = express();
app.use(express.json());
app.use(
	createRegisterRouter(
		new RegisterUserController({
			registerUser: mockRegisterUser,
		} as never),
	),
);

describe("POST /register", () => {
	beforeEach(async () => {
		vi.resetAllMocks();
	});

	it("creates an account when fullName, email and password are valid", async () => {
		mockRegisterUser.mockResolvedValue(undefined);

		const response = await request(app).post("/register").send({
			fullName: "Test User",
			email: "test.user@example.com",
			password: "Strong!Pass9",
		});

		expect(response.status).toBe(201);
		expect(response.body).toEqual({ message: "Account created successfully" });
	});

	it("rejects invalid email format", async () => {
		const response = await request(app).post("/register").send({
			fullName: "Test User",
			email: "not-an-email",
			password: "Strong!Pass9",
		});

		expect(response.status).toBe(400);
		expect(response.body.message).toBe("Invalid email format");
		expect(mockRegisterUser).not.toHaveBeenCalled();
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
		expect(mockRegisterUser).not.toHaveBeenCalled();
	});

	it("returns 201 for a valid registration", async () => {
		mockRegisterUser.mockResolvedValue(undefined);

		const response = await request(app).post("/register").send({
			fullName: "Test User",
			email: "test.user@example.com",
			password: "Strong!Pass9",
		});

		expect(response.status).toBe(201);
		expect(response.body).toEqual({ message: "Account created successfully" });
	});

	it("returns 409 when the controller reports a duplicate email", async () => {
		mockRegisterUser.mockRejectedValueOnce(new DuplicateUserEmailError());

		const response = await request(app).post("/register").send({
			fullName: "Test User",
			email: "test.user@example.com",
			password: "Strong!Pass9",
		});

		expect(response.status).toBe(409);
		expect(response.body).toEqual({ message: "Email already exists" });
	});
});
