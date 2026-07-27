import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	InvalidCredentialsError,
	UserNotFoundError,
} from "../../src/errors/userErrors.js";

const mockLogin = vi.fn();

vi.mock("../../src/services/loginService.js", () => ({
	default: class {
		async login() {
			return mockLogin();
		}
	},
}));

import { app } from "../../src/app.js";

describe("POST /login", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("returns 200 with a token when credentials are valid", async () => {
		mockLogin.mockResolvedValue({ token: "valid-jwt-token" });

		const response = await request(app).post("/login").send({
			email: "user@example.com",
			password: "password123",
		});

		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty("token");
	});

	it("returns 400 when email is missing", async () => {
		const response = await request(app).post("/login").send({
			password: "password123",
		});

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty("message");
		expect(mockLogin).not.toHaveBeenCalled();
	});

	it("returns 400 when password is missing", async () => {
		const response = await request(app).post("/login").send({
			email: "user@example.com",
		});

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty("message");
		expect(mockLogin).not.toHaveBeenCalled();
	});

	it("returns 400 when email format is invalid", async () => {
		const response = await request(app).post("/login").send({
			email: "not-an-email",
			password: "password123",
		});

		expect(response.status).toBe(400);
		expect(response.body.message).toBe("Invalid email address");
		expect(mockLogin).not.toHaveBeenCalled();
	});

	it("returns 401 when user is not found", async () => {
		mockLogin.mockRejectedValue(new UserNotFoundError());

		const response = await request(app).post("/login").send({
			email: "unknown@example.com",
			password: "password123",
		});

		expect(response.status).toBe(401);
		expect(response.body).toEqual({ message: "Invalid email or password" });
	});

	it("returns 401 when password is incorrect", async () => {
		mockLogin.mockRejectedValue(new InvalidCredentialsError());

		const response = await request(app).post("/login").send({
			email: "user@example.com",
			password: "wrongpassword",
		});

		expect(response.status).toBe(401);
		expect(response.body).toEqual({ message: "Invalid email or password" });
	});
});
