import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "./app.js";

describe("GET /health", () => {
	it("returns a healthy response", async () => {
		const response = await request(app).get("/health");

		expect(response.status).toBe(200);
		expect(response.body).toMatchObject({ status: "UP" });
		expect(typeof response.body.timestamp).toBe("string");
		expect(Number.isNaN(Date.parse(response.body.timestamp))).toBe(false);
	});
});
