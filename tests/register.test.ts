import argon2 from "argon2";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { app } from "../src/app.js";
import { __testing } from "../src/routes/register.js";

describe("POST /register", () => {
	beforeEach(async () => {
		await __testing.resetUsers();
	});

	it("creates an account when fullName, email and password are valid", async () => {
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
	});

	it("stores users with role user by default", async () => {
		const response = await request(app).post("/register").send({
			fullName: "Test User",
			email: "test.user@example.com",
			password: "Strong!Pass9",
		});

		expect(response.status).toBe(201);

		const users = await __testing.getUsers();
		expect(users).toHaveLength(1);
		expect(users[0]?.role).toBe("user");
	});

	it("hashes and salts passwords", async () => {
		await request(app).post("/register").send({
			fullName: "First User",
			email: "first.user@example.com",
			password: "Strong!Pass9",
		});

		await request(app).post("/register").send({
			fullName: "Second User",
			email: "second.user@example.com",
			password: "Strong!Pass9",
		});

		const users = await __testing.getUsers();
		expect(users).toHaveLength(2);

		const firstHash = users[0]?.passwordHash;
		const secondHash = users[1]?.passwordHash;

		expect(firstHash).toBeDefined();
		expect(secondHash).toBeDefined();
		expect(firstHash).not.toBe("Strong!Pass9");
		expect(secondHash).not.toBe("Strong!Pass9");
		expect(firstHash).not.toBe(secondHash);
		expect(await argon2.verify(firstHash ?? "", "Strong!Pass9")).toBe(true);
		expect(await argon2.verify(secondHash ?? "", "Strong!Pass9")).toBe(true);
	});
});
