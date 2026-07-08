import express from "express";
import cors from "cors";
import { registerRouter } from "./routes/register.js";

export const app = express();

app.use(cors({ origin: "http://localhost:3001" }));
app.use(express.json());

app.get("/health", (_req, res) => {
    res.json({ status: "UP", timestamp: new Date().toISOString() });
});

app.use(registerRouter);