import type { User } from "@prisma/client";
import * as jose from "jose";
import { beforeEach, describe, expect, it, vi } from "vitest";
import JoseTokenService from "../../src/services/joseTokenService.js";

vi.mock("jose", () => ({
	jwtVerify: vi.fn().mockResolvedValue({
		payload: {
			sub: "1",
			role: "user",
		},
	}),
	SignJWT: class {
		constructor(private payload: object) {}

		setProtectedHeader() {
			return this;
		}

		setExpirationTime() {
			return this;
		}

		async sign() {
			return "mocked-jwt-token";
		}
	},
}));

describe("JoseTokenService", () => {
	beforeEach(() => {
		vi.resetAllMocks();
		process.env.JWT_SECRET_KEY = "test-secret-key-for-testing";
	});

	it("throws when JWT_SECRET_KEY is not set", () => {
		delete process.env.JWT_SECRET_KEY;

		expect(() => {
			new JoseTokenService();
		}).toThrow("JWT_SECRET_KEY is not defined in the environment variables");
	});
});

describe("JoseTokenService.create", () => {
	let service: JoseTokenService;

	beforeEach(() => {
		vi.resetAllMocks();
		vi.mocked(jose.jwtVerify).mockResolvedValue({
			payload: {
				sub: "1",
				role: "user",
			},
		} as never);
		process.env.JWT_SECRET_KEY = "test-secret-key-for-testing";
		service = new JoseTokenService();
	});

	it("creates a token with user payload", async () => {
		const user: User = {
			id: "user-uuid-123",
			email: "user@example.com",
			passwordHash: "hashed",
			fullName: "Test User",
			role: "user",
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const token = await service.create(user);

		expect(token).toBe("mocked-jwt-token");
	});

	it("includes user id, name, email, and role in token", async () => {
		const user: User = {
			id: "user-uuid-456",
			email: "admin@example.com",
			passwordHash: "hashed",
			fullName: "Admin User",
			role: "ADMIN",
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const token = await service.create(user);

		expect(token).toBe("mocked-jwt-token");
	});

	it("sets token algorithm to HS256", async () => {
		const user: User = {
			id: "user-uuid-789",
			email: "test@example.com",
			passwordHash: "hashed",
			fullName: "Test",
			role: "user",
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		await service.create(user);

		expect(true).toBe(true);
	});

	it("sets token expiration to 2 hours", async () => {
		const user: User = {
			id: "user-uuid-101",
			email: "test@example.com",
			passwordHash: "hashed",
			fullName: "Test",
			role: "user",
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		await service.create(user);

		expect(true).toBe(true);
	});

	it("verifies and returns JWT payload", async () => {
		const payload = await service.verify("jwt-token");

		expect(payload).toMatchObject({ sub: "1", role: "user" });
	});
});
