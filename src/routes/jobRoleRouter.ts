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

router.get("/", (req, res) => controller.getAll(req, res));

import { validateParams } from "../middleware/validateParams.js";
import idParamSchema from "../validators/idParamSchema.js";

router.get("/:id", validateParams(idParamSchema), (req, res) =>
	controller.getById(req, res),
);

export default router;
