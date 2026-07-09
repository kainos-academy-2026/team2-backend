import { Router } from "express";
import { JobRoleController } from "../controllers/jobRoleController.js";
import { JobRoleDao } from "../daos/jobRoleDao.js";
import { JobRoleMapper } from "../mappers/jobRoleMapper.js";
import { authenticateToken, authorizeRoles } from "../middleware/authenticate.js";
import { JobRoleService } from "../services/jobRoleService.js";

const router = Router();
const service = new JobRoleService(new JobRoleDao(), new JobRoleMapper());
const controller = new JobRoleController(service);

router.get(
	"/",
	authenticateToken,
	authorizeRoles("RECRUITMENT_ADMIN", "APPLICANT"),
	(req, res) => controller.getAll(req, res),
);

export default router;