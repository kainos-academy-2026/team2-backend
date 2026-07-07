import express from "express";
import jobRoleRouter from "./routes/jobRoleRouter.js";

const PORT = process.env["PORT"];

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
	const status = "UP";
	res.json({ status, timestamp: new Date().toISOString() });
});

app.use("/job-roles", jobRoleRouter);

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
