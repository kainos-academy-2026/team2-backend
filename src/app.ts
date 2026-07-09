import cors from "cors";
import express, {
	type NextFunction,
	type Request,
	type RequestHandler,
	type Response,
} from "express";
import { RegisterUserController } from "./controllers/registerUserController.js";
import { UserDao } from "./daos/userDao.js";
import jobRoleRouter from "./routes/jobRoleRouter.js";
import { createRegisterRouter } from "./routes/register.js";
import { RegisterUserService } from "./services/registerUserService.js";
import { registerUserSchema } from "./validators/registerUserValidator.js";

export const app = express();

export const validateRegisterUser: RequestHandler = (req, res, next): void => {
	const parsedRequest = registerUserSchema.safeParse(req.body ?? {});

	if (!parsedRequest.success) {
		const firstIssue =
			parsedRequest.error.issues[0]?.message ?? "Invalid request body";
		res.status(400).json({ message: firstIssue });
		return;
	}

	req.body = parsedRequest.data;
	next();
};

const registerRouter = createRegisterRouter(
	new RegisterUserController(new RegisterUserService(new UserDao())),
	validateRegisterUser,
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
