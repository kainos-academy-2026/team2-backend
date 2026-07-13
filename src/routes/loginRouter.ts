import { Router } from "express";
import { LoginController } from "../controllers/loginController.js";
import { UserDao } from "../daos/userDao.js";
import { validateBody } from "../middleware/validateBody.js";
import Argon2PasswordHashingService from "../services/argon2PasswordHashingService.js";
import JoseTokenService from "../services/joseTokenService.js";
import LoginService from "../services/loginService.js";
import loginRequestSchema from "../validators/loginUserValidator.js";

const loginRouter = Router();
const userDao = new UserDao();
const passwordHasher = new Argon2PasswordHashingService();
const tokenService = new JoseTokenService();
const loginService = new LoginService(userDao, passwordHasher, tokenService);
const loginController = new LoginController(loginService);

loginRouter.post("/login", validateBody(loginRequestSchema), (req, res) =>
	loginController.login(req, res),
);

export default loginRouter;
