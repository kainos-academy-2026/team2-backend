import { z } from "zod";

const idParamSchema = z.object({
	id: z.string().regex(/^[1-9]\d*$/, "Job role ID must be a positive integer"),
});

export default idParamSchema;
