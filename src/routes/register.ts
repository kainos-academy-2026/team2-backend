import { Router } from "express";
import { RegisterUserController } from "../controllers/registerUserController.js";

export const createRegisterRouter = (
	registerUserController: RegisterUserController,
): ReturnType<typeof Router> => {
	const registerRouter = Router();

	registerRouter.post("/register", registerUserController.register);

	return registerRouter;
};
