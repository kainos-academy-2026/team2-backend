export interface CreateJobRoleInput {
	roleName: string;
	location: string;
	capabilityId: number;
	bandId: number;
	closingDate: Date;
	description: string;
	sharepointUrl: string;
	responsibilities: string[];
	numberOfOpenPositions: number;
}
