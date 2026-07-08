import { Router } from "express";
import { RegisterUserController } from "../controllers/registerUserController.js";
import { UserDao } from "../daos/userDao.js";
import { RegisterUserService } from "../services/registerUserService.js";

export const createRegisterRouter = (
	registerUserController: RegisterUserController = new RegisterUserController(
		new RegisterUserService(new UserDao()),
	),
): ReturnType<typeof Router> => {
	const registerRouter = Router();

	registerRouter.post("/register", registerUserController.register);

	return registerRouter;
};

const registerRouter = createRegisterRouter();

export { registerRouter };
