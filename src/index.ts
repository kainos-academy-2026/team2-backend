import express from "express";

const PORT = 3000;
const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
	const status = "UP";
	res.json({ status, timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
