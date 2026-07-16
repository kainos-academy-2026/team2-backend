import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../src/app.js";

describe("GET /health", () => {
	it("returns 200", async () => {
		const response = await request(app).get("/health");

		expect(response.status).toBe(200);
	});

	it("returns UP status with an ISO timestamp", async () => {
		const response = await request(app).get("/health");

		expect(response.body).toMatchObject({ status: "UP" });
		expect(typeof response.body.timestamp).toBe("string");
		expect(Number.isNaN(Date.parse(response.body.timestamp))).toBe(false);
	});
});

describe("Unsupported methods on /health", () => {
	it("redirects to login for POST without auth token", async () => {
		const response = await request(app).post("/health").send({});

		expect(response.status).toBe(401);
		expect(response.body).toEqual({ message: "Unauthorized" });
	});
});
