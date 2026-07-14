import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app.js";

describe("Authentication enforcement", () => {
	it("redirects non-logged-in users on protected endpoint", async () => {
		const response = await request(app).get("/job-roles");

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/login");
	});

	it("does not enforce auth on /register", async () => {
		const response = await request(app).post("/register").send({});

		expect(response.status).toBe(400);
		expect(response.headers.location).toBeUndefined();
	});

	it("does not enforce auth on /login", async () => {
		const response = await request(app).post("/login").send({});

		expect(response.status).toBe(400);
		expect(response.headers.location).toBeUndefined();
	});
});
