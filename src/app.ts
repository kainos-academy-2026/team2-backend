import cors from "cors";
import express, {
	type NextFunction,
	type Request,
	type Response,
} from "express";
import { RegisterUserController } from "./controllers/registerUserController.js";
import { UserDao } from "./daos/userDao.js";
import jobRoleRouter from "./routes/jobRoleRouter.js";
import { createRegisterRouter } from "./routes/register.js";
import { RegisterUserService } from "./services/registerUserService.js";

export const app = express();

const registerRouter = createRegisterRouter(
	new RegisterUserController(new RegisterUserService(new UserDao())),
);

const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:3001";
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

app.get("/health", (_req, res) => {
	res.json({ status: "UP", timestamp: new Date().toISOString() });
});

app.use("/job-roles", jobRoleRouter);
app.use(registerRouter);

app.use((_err: Error, _req: Request, res: Response, _next: NextFunction) => {
	res.status(500).json({ message: "Internal server error" });
});
