import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "./app.js";

describe("health endpoint", () => {
	it("returns a healthy response", async () => {
		const response = await request(app).get("/health");

		expect(response.status).toBe(200);
		expect(response.body.status).toBe("UP");
		expect(typeof response.body.timestamp).toBe("string");
	});
});
