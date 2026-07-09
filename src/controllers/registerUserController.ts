import type { Request, Response } from "express";
import { DuplicateUserEmailError } from "../errors/userErrors.js";
import type { RegisterUserService } from "../services/registerUserService.js";

export class RegisterUserController {
	constructor(private readonly registerUserService: RegisterUserService) {}

	register = async (req: Request, res: Response): Promise<void> => {
		try {
			await this.registerUserService.registerUser(req.body);
			res.status(201).json({ message: "Account created successfully" });
		} catch (error: unknown) {
			if (error instanceof DuplicateUserEmailError) {
				res.status(409).json({ message: error.message });
				return;
			}

			const message =
				error instanceof Error ? error.message : "Unknown error value thrown";
			console.error("Register user failed", { message, error });
			res.status(500).json({ message: "Internal server error" });
		}
	};
}