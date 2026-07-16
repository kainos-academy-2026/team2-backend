import type { Request, Response } from "express";
import { Router } from "express";
import { JobApplicationController } from "../controllers/jobApplicationController.js";
import { JobRoleController } from "../controllers/jobRoleController.js";
import { JobApplicationDao } from "../daos/jobApplicationDao.js";
import { JobRoleDao } from "../daos/jobRoleDao.js";
import { UserDao } from "../daos/userDao.js";
import { JobApplicationMapper } from "../mappers/jobApplicationMapper.js";
import { JobRoleMapper } from "../mappers/jobRoleMapper.js";
import { requireAdmin } from "../middleware/auth.js";
import { validateBody } from "../middleware/validateBody.js";
import { validateParams } from "../middleware/validateParams.js";
import { JobApplicationService } from "../services/jobApplicationService.js";
import { JobRoleService } from "../services/jobRoleService.js";
import S3CvStorageService from "../services/s3CvStorageService.js";
import { applyForRoleSchema } from "../validators/applyForRoleValidator.js";
import createJobRoleSchema from "../validators/createJobRoleValidator.js";
import idParamSchema from "../validators/idParamSchema.js";
import { requestCvUploadUrlSchema } from "../validators/requestCvUploadUrlValidator.js";

const jobRoleRouter = Router();
const jobRoleDao = new JobRoleDao();
const jobRoleService = new JobRoleService(jobRoleDao, new JobRoleMapper());
const jobRoleController = new JobRoleController(jobRoleService);
const jobApplicationMapper = new JobApplicationMapper();
const jobApplicationService = new JobApplicationService(
	jobRoleDao,
	new UserDao(),
	new JobApplicationDao(jobApplicationMapper),
	new S3CvStorageService(),
	jobApplicationMapper,
);
const jobApplicationController = new JobApplicationController(
	jobApplicationService,
);

jobRoleRouter.get("/job-roles", (req: Request, res: Response) =>
	jobRoleController.getAll(req, res),
);

jobRoleRouter.get(
	"/job-roles/:id",
	validateParams(idParamSchema),
	(req: Request, res: Response) => jobRoleController.getById(req, res),
);

jobRoleRouter.post(
	"/job-roles",
	requireAdmin,
	validateBody(createJobRoleSchema),
	(req: Request, res: Response) => jobRoleController.create(req, res),
);

jobRoleRouter.post(
	"/job-roles/:id/applications/upload-url",
	validateParams(idParamSchema),
	validateBody(requestCvUploadUrlSchema),
	jobApplicationController.createCvUploadUrl,
);

jobRoleRouter.post(
	"/job-roles/:id/applications",
	validateParams(idParamSchema),
	validateBody(applyForRoleSchema),
	jobApplicationController.applyForRole,
);

export default jobRoleRouter;
