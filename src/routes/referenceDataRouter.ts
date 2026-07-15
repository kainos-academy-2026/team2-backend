import type { Request, Response } from "express";
import { Router } from "express";
import { ReferenceDataController } from "../controllers/referenceDataController.js";
import { JobRoleDao } from "../daos/jobRoleDao.js";
import { JobRoleMapper } from "../mappers/jobRoleMapper.js";
import { requireAnyRole } from "../middleware/auth.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { Role } from "../models/user.js";
import { JobRoleService } from "../services/jobRoleService.js";

const referenceDataRouter = Router();
const jobRoleService = new JobRoleService(
	new JobRoleDao(),
	new JobRoleMapper(),
);
const referenceDataController = new ReferenceDataController(jobRoleService);

referenceDataRouter.use((req, res, next) => {
	requireAnyRole([Role.User, Role.Admin])(req, res, next);
});

referenceDataRouter.get("/bands", requireAuth, (req: Request, res: Response) =>
	referenceDataController.getBands(req, res),
);

referenceDataRouter.get(
	"/capabilities",
	requireAuth,
	(req: Request, res: Response) =>
		referenceDataController.getCapabilities(req, res),
);

export default referenceDataRouter;
