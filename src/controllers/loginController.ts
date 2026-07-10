import type { Request, Response } from "express";
import type LoginService from "../services/loginService.ts";
import type { LoginRequestDto } from "../dtos/loginRequestDto.ts";

export class LoginController {
    constructor(private readonly loginService: LoginService) {}

    login = async (req: Request, res: Response): Promise<void> => {
        try {
            const response = await this.loginService.login(req.body as LoginRequestDto);
            res.status(200).json(response);
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : "Unknown error value thrown";

            if (message === "User not found" || message === "Invalid password") {
                res.status(401).json({ message: "Invalid email or password" });
                return;
            }

            console.error("Login failed", { message, error });
            res.status(500).json({ message: "Internal server error" });
        }
    }
}