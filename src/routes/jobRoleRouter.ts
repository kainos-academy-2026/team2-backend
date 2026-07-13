import type { Request, Response } from "express";
import { Router } from "express";
import { JobRoleController } from "../controllers/jobRoleController.js";
import { JobRoleDao } from "../daos/jobRoleDao.js";
import { JobRoleMapper } from "../mappers/jobRoleMapper.js";
import { JobRoleService } from "../services/jobRoleService.js";

const jobRoleRouter = Router();
const jobRoleService = new JobRoleService(
	new JobRoleDao(),
	new JobRoleMapper(),
);
const jobRoleController = new JobRoleController(jobRoleService);

jobRoleRouter.get("/", (req: Request, res: Response) =>
	jobRoleController.getAll(req, res),
);

import { validateParams } from "../middleware/validateParams.js";
import idParamSchema from "../validators/idParamSchema.js";

jobRoleRouter.get(
	"/:id",
	validateParams(idParamSchema),
	(req: Request, res: Response) => jobRoleController.getById(req, res),
);

export default jobRoleRouter;
