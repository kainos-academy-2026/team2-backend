import { Router } from "express";
import { JobRoleController } from "../controllers/jobRoleController.js";
import { JobRoleDao } from "../daos/jobRoleDao.js";
import { JobRoleMapper } from "../mappers/jobRoleMapper.js";
import { JobRoleService } from "../services/jobRoleService.js";

const jobRoleRouter = Router();
const jobRoleService = new JobRoleService(new JobRoleDao(), new JobRoleMapper());
const jobRoleController = new JobRoleController(jobRoleService);

jobRoleRouter.get("/", (req, res) => jobRoleController.getAll(req, res));

export default jobRoleRouter;