import type { Request, Response } from "express";
import { Router } from "express";
import { JobRoleController } from "../controllers/jobRoleController.js";
import { JobRoleDao } from "../daos/jobRoleDao.js";
import { JobRoleMapper } from "../mappers/jobRoleMapper.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validateBody } from "../middleware/validateBody.js";
import { requireAnyRole } from "../middleware/auth.js";
import { validateParams } from "../middleware/validateParams.js";
import { Role } from "../models/user.js";
import { JobRoleService } from "../services/jobRoleService.js";
import createJobRoleSchema from "../validators/createJobRoleValidator.js";
import idParamSchema from "../validators/idParamSchema.js";

const jobRoleRouter = Router();
const jobRoleService = new JobRoleService(
	new JobRoleDao(),
	new JobRoleMapper(),
);
const jobRoleController = new JobRoleController(jobRoleService);

jobRoleRouter.use((req, res, next) => {
	if (req.method === "GET") {
		requireAnyRole([Role.User, Role.Admin])(req, res, next);
		return;
	}

	requireAdmin(req, res, next);
});

jobRoleRouter.get("/", (req: Request, res: Response) =>
	jobRoleController.getAll(req, res),
);

jobRoleRouter.get("/bands", requireAuth, (req: Request, res: Response) =>
	jobRoleController.getBands(req, res),
);

jobRoleRouter.get("/capabilities", requireAuth, (req: Request, res: Response) =>
	jobRoleController.getCapabilities(req, res),
);

jobRoleRouter.get(
	"/:id",
	validateParams(idParamSchema),
	(req: Request, res: Response) => jobRoleController.getById(req, res),
);

jobRoleRouter.post(
	"/add",
	requireAdmin,
	validateBody(createJobRoleSchema),
	(req: Request, res: Response) => jobRoleController.create(req, res),
);

export default jobRoleRouter;
