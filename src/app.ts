import cors from "cors";
import express, {
	type NextFunction,
	type Request,
	type RequestHandler,
	type Response,
} from "express";
import { validateBody } from "./middleware/validateBody.js";
import jobRoleRouter from "./routes/jobRoleRouter.js";
import registerRouter from "./routes/register.js";
import { registerUserSchema } from "./validators/registerUserValidator.js";

export const app = express();

const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:3001";
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

app.get("/", (_req, res) => {
	res.status(200).json({
		message: "Team 2 backend is running",
		endpoints: {
			health: "/health",
			jobRoles: "/job-roles",
			register: "POST /",
		},
	});
});

app.get("/health", (_req, res) => {
	res.json({ status: "UP", timestamp: new Date().toISOString() });
});

app.use("/job-roles", jobRoleRouter);
app.use(registerRouter);

app.use((_err: Error, _req: Request, res: Response, _next: NextFunction) => {
	res.status(500).json({ message: "Internal server error" });
});
