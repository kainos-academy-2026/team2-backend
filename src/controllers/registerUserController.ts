import type { Request, Response } from "express";
import { DuplicateUserEmailError } from "../errors/userErrors.js";
import type { RegisterUserService } from "../services/registerUserService.js";
import {
	getRegisterUserValidationMessage,
	registerUserSchema,
} from "../validators/registerUserValidator.js";

export class RegisterUserController {
	constructor(private readonly registerUserService: RegisterUserService) {}

	register = async (req: Request, res: Response): Promise<void> => {
		const parsedRequest = registerUserSchema.safeParse(req.body ?? {});

		if (!parsedRequest.success) {
			res
				.status(400)
				.json({ message: getRegisterUserValidationMessage(parsedRequest.error) });
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