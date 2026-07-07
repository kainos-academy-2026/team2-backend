
import { JobRoleDao } from "../daos/jobRoleDao.js";
import type { JobRole } from "../models/jobRole.js";

export class JobRoleService {
  constructor(private readonly jobRoleDao: JobRoleDao = new JobRoleDao()) {}

  async findAllOpen(): Promise<JobRole[]> {
    return this.jobRoleDao.findOpenJobRoles();
  }
}