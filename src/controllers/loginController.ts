import type { Request, Response } from "express";
import type { LoginRequestDto } from "../dtos/loginRequestDto.ts";
import {
	InvalidCredentialsError,
	UserNotFoundError,
} from "../errors/userErrors.js";
import type LoginService from "../services/loginService.ts";

export class LoginController {
	constructor(private readonly loginService: LoginService) {}

	login = async (req: Request, res: Response): Promise<void> => {
		try {
			const response = await this.loginService.login(
				req.body as LoginRequestDto,
			);
			res.status(200).json(response);
		} catch (error: unknown) {
			if (
				error instanceof UserNotFoundError ||
				error instanceof InvalidCredentialsError
			) {
				res.status(401).json({ message: "Invalid email or password" });
				return;
			}

			console.error("Login failed", { error });
			res.status(500).json({ message: "Internal server error" });
		}
	};
}
