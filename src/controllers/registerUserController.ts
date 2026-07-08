import type { Request, Response } from "express";
import { z } from "zod";
import { DuplicateUserEmailError } from "../errors/userErrors.js";
import type { RegisterUserService } from "../services/registerUserService.js";

const PASSWORD_POLICY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{9,}$/;

const registerUserSchema = z.object({
	fullName: z.string().trim().min(1),
	email: z.string().trim().toLowerCase().email("Invalid email format"),
	password: z
		.string()
		.min(
			9,
			"Password must be at least 9 characters and include uppercase, lowercase, and a special character",
		)
		.regex(
			PASSWORD_POLICY_REGEX,
			"Password must be at least 9 characters and include uppercase, lowercase, and a special character",
		),
});

const requiredMessage = "fullName, email, and password are required";

const getValidationMessage = (error: z.ZodError): string => {
	const issue = error.issues[0];

	if (!issue) {
		return requiredMessage;
	}

	if (issue.path[0] === "email" && issue.code === "invalid_format") {
		return "Invalid email format";
	}

	if (issue.path[0] === "password") {
		return "Password must be at least 9 characters and include uppercase, lowercase, and a special character";
	}

	return requiredMessage;
};

export class RegisterUserController {
	constructor(private readonly registerUserService: RegisterUserService) {}

	register = async (req: Request, res: Response): Promise<void> => {
		const parsedRequest = registerUserSchema.safeParse(req.body ?? {});

		if (!parsedRequest.success) {
			res.status(400).json({ message: getValidationMessage(parsedRequest.error) });
			return;
		}

		try {
			await this.registerUserService.registerUser(parsedRequest.data);
			res.status(201).json({ message: "Account created successfully" });
		} catch (error: unknown) {
			if (error instanceof DuplicateUserEmailError) {
				res.status(409).json({ message: error.message });
				return;
			}

			res.status(500).json({ message: "Internal server error" });
		}
	};
}