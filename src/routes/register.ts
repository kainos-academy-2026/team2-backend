import { type RequestHandler, Router } from "express";
import { RegisterUserController } from "../controllers/registerUserController.js";
import { UserDao } from "../daos/userDao.js";
import { validateBody } from "../middleware/validateBody.js";
import Argon2PasswordHashingService from "../services/argon2PasswordHashingService.js";
import { RegisterUserService } from "../services/registerUserService.js";
import { registerUserSchema } from "../validators/registerUserValidator.js";

const registerRouter = Router();

const userDao = new UserDao();
const passwordHasher = new Argon2PasswordHashingService();
const registerUserService = new RegisterUserService(userDao, passwordHasher);
const registerUserController = new RegisterUserController(registerUserService);

registerRouter.post(
	"/",
	validateBody(registerUserSchema),
	registerUserController.register,
);

export default registerRouter;
