import { Router, type RequestHandler } from "express";
import { RegisterUserController } from "../controllers/registerUserController.js";

export const createRegisterRouter = (
	registerUserController: RegisterUserController,
	validateRegisterUser: RequestHandler,
): ReturnType<typeof Router> => {
	const registerRouter = Router();

	registerRouter.post(
		"/register",
		validateRegisterUser,
		registerUserController.register,
	);

	return registerRouter;
};
