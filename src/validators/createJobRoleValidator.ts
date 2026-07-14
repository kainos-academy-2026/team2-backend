import { z } from "zod";

const createJobRoleSchema = z.object({
	name: z.string().trim().min(1, { message: "Name is required" }),
	location: z.string().trim().min(1, { message: "Location is required" }),
	capability: z.string().trim().min(1, { message: "Capability is required" }),
	band: z.string().trim().min(1, { message: "Band is required" }),
	closingDate: z
		.string()
		.date("Closing date must be a valid date in YYYY-MM-DD format"),
	description: z.string().trim().optional().default(""),
	sharepointUrl: z.string().trim().optional().default(""),
	responsibilities: z.array(z.string()).optional().default([]),
	numberOfOpenPositions: z
		.number()
		.int()
		.nonnegative({
			message: "Number of open positions must be a non-negative integer",
		})
		.optional()
		.default(0),
});

export default createJobRoleSchema;
