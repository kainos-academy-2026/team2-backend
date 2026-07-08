import cors from "cors";
import express from "express";
import { registerRouter } from "./routes/register.js";

export const app = express();

const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:3001";
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

app.get("/health", (_req, res) => {
	res.json({ status: "UP", timestamp: new Date().toISOString() });
});

app.use(registerRouter);
