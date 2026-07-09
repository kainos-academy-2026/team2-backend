import { Router, type RequestHandler } from "express";
import { RegisterUserController } from "../controllers/registerUserController.js";
import { validateBody } from "../middleware/validateBody.js";
import { registerUserSchema } from "../validators/registerUserValidator.js";
import { UserDao } from "../daos/userDao.js";
import { RegisterUserService } from "../services/registerUserService.js";

const registerRouter = Router();

const userDao = new UserDao();
const registerUserService = new RegisterUserService(userDao);
const registerUserController = new RegisterUserController(registerUserService);

registerRouter.post(
    "/",
    validateBody(registerUserSchema),
    registerUserController.register,
);

export default registerRouter;