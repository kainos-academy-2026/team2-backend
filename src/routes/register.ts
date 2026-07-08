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

	if (!fullName || !email || !password) {
		res
			.status(400)
			.json({ message: "fullName, email, and password are required" });
		return;
	}

	if (typeof email !== "string" || !isValidEmail(email)) {
		res.status(400).json({ message: "Invalid email format" });
		return;
	}

	if (typeof password !== "string" || !isValidPassword(password)) {
		res.status(400).json({
			message:
				"Password must be at least 9 characters and include uppercase, lowercase, and a special character",
		});
		return;
	}

	const normalizedEmail = normalizeEmail(email);

	const existingUser = await prisma.user.findUnique({
		where: { email: normalizedEmail },
	});
	if (existingUser) {
		res.status(409).json({ message: "Email already exists" });
		return;
	}

	const passwordHash = await argon2.hash(password);

	await prisma.user.create({
		data: {
			fullName,
			email: normalizedEmail,
			passwordHash,
		},
	});

	res.status(201).json({ message: "Account created successfully" });
});
