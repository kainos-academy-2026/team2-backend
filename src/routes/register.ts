import argon2 from "argon2";
import { type Request, type Response, Router } from "express";
import { prisma } from "../lib/prisma.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_POLICY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{9,}$/;

export const registerRouter = Router();

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const isValidEmail = (email: string): boolean => EMAIL_REGEX.test(email);

const isValidPassword = (password: string): boolean =>
	PASSWORD_POLICY_REGEX.test(password);

export const __testing = {
	resetUsers: async (): Promise<void> => {
		await prisma.user.deleteMany();
	},
	getUsers: async () => prisma.user.findMany({ orderBy: { id: "asc" } }),
};

registerRouter.post("/register", async (req: Request, res: Response) => {
	const { fullName, email, password } = req.body;

	if (
		typeof fullName !== "string" ||
		typeof email !== "string" ||
		typeof password !== "string"
	) {
		res
			.status(400)
			.json({ message: "fullName, email, and password are required" });
		return;
	}

	const trimmedFullName = fullName.trim();
	const normalizedEmail = normalizeEmail(email);

	if (!trimmedFullName || !normalizedEmail || !password) {
		res
			.status(400)
			.json({ message: "fullName, email, and password are required" });
		return;
	}

	if (!isValidEmail(normalizedEmail)) {
		res.status(400).json({ message: "Invalid email format" });
		return;
	}

	if (!isValidPassword(password)) {
		res.status(400).json({
			message:
				"Password must be at least 9 characters and include uppercase, lowercase, and a special character",
		});
		return;
	}
	const existingUser = await prisma.user.findUnique({
		where: { email: normalizedEmail },
	});
	if (existingUser) {
		res.status(409).json({ message: "Email already exists" });
		return;
	}

	const passwordHash = await argon2.hash(password);

	try {
		await prisma.user.create({
			data: {
				fullName: trimmedFullName,
				email: normalizedEmail,
				passwordHash,
			},
		});
	} catch (err: unknown) {
		if (
			typeof err === "object" &&
			err !== null &&
			"code" in err &&
			(err as { code?: string }).code === "P2002"
		) {
			res.status(409).json({ message: "Email already exists" });
			return;
		}
		throw err;
	}

	res.status(201).json({ message: "Account created successfully" });
});
