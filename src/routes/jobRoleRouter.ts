import type { Request, Response } from "express";
import { Router } from "express";
import multer from "multer";
import { JobApplicationController } from "../controllers/jobApplicationController.js";
import { JobRoleController } from "../controllers/jobRoleController.js";
import { JobApplicationDao } from "../daos/jobApplicationDao.js";
import { JobRoleDao } from "../daos/jobRoleDao.js";
import { UserDao } from "../daos/userDao.js";
import { JobApplicationMapper } from "../mappers/jobApplicationMapper.js";
import { JobRoleMapper } from "../mappers/jobRoleMapper.js";
import { validateBody } from "../middleware/validateBody.js";
import { validateParams } from "../middleware/validateParams.js";
import { JobApplicationService } from "../services/jobApplicationService.js";
import { JobRoleService } from "../services/jobRoleService.js";
import S3CvStorageService from "../services/s3CvStorageService.js";
import { applyForRoleSchema } from "../validators/applyForRoleValidator.js";
import idParamSchema from "../validators/idParamSchema.js";

const jobRoleRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });
const jobRoleDao = new JobRoleDao();
const jobRoleService = new JobRoleService(jobRoleDao, new JobRoleMapper());
const jobRoleController = new JobRoleController(jobRoleService);
const jobApplicationService = new JobApplicationService(
	jobRoleDao,
	new UserDao(),
	new JobApplicationDao(),
	new S3CvStorageService(),
	new JobApplicationMapper(),
);
const jobApplicationController = new JobApplicationController(
	jobApplicationService,
);

jobRoleRouter.get("/", (req: Request, res: Response) =>
	jobRoleController.getAll(req, res),
);

jobRoleRouter.get(
	"/:id",
	validateParams(idParamSchema),
	(req: Request, res: Response) => jobRoleController.getById(req, res),
);

jobRoleRouter.post(
	"/:id/applications",
	upload.single("cv"),
	validateParams(idParamSchema),
	validateBody(applyForRoleSchema),
	jobApplicationController.applyForRole,
);

export default jobRoleRouter;
