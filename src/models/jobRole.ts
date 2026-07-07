import type { JobRoleStatus } from "@prisma/client";

export interface JobRole {
	jobRoleId: number;
	roleName: string;
	location: string;
	capabilityId: number;
	bandId: number;
	closingDate: Date;
	status: JobRoleStatus;
	capability: {
		capabilityId: number;
		capabilityName: string;
	};
	band: {
		nameId: number;
		bandName: string;
	};
}
