import { Router } from "express";
import { LoginController } from "../controllers/loginController.js";
import { UserDao } from "../daos/userDao.js";
import type TokenService from "../interfaces/tokenService.js";
import { validateBody } from "../middleware/validateBody.js";
import Argon2PasswordHashingService from "../services/argon2PasswordHashingService.js";
import LoginService from "../services/loginService.js";
import loginRequestSchema from "../validators/loginUserValidator.js";

export default function createLoginRouter(tokenService: TokenService): Router {
	const loginRouter = Router();
	const userDao = new UserDao();
	const passwordHasher = new Argon2PasswordHashingService();
	const loginService = new LoginService(userDao, passwordHasher, tokenService);
	const loginController = new LoginController(loginService);

	loginRouter.post("/login", validateBody(loginRequestSchema), (req, res) =>
		loginController.login(req, res),
	);

	return loginRouter;
}
