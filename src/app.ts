import cors from "cors";
import express, {
	type NextFunction,
	type Request,
	type Response,
} from "express";
import { authenticateRequest } from "./middleware/auth.js";
import jobRoleRouter from "./routes/jobRoleRouter.js";
import createLoginRouter from "./routes/loginRouter.js";
import referenceDataRouter from "./routes/referenceDataRouter.js";
import registerRouter from "./routes/register.js";
import JoseTokenService from "./services/joseTokenService.js";

export const app = express();

const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:3001";
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

app.get("/health", (_req, res) => {
	res.json({ status: "UP", timestamp: new Date().toISOString() });
});

const tokenService = new JoseTokenService();
app.use(createLoginRouter(tokenService));
app.use(registerRouter);

app.use(authenticateRequest(tokenService));
app.use(referenceDataRouter);
app.use(jobRoleRouter);

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
	console.error(error.message);
	res.status(500).json({ message: "Internal server error" });
});
