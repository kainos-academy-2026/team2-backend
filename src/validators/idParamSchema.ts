import { z } from "zod";

const idParamSchema = z.object({
	id: z.string().min(1, "ID parameter is required"),
});

export default idParamSchema;
