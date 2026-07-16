export interface CreateJobRoleRequestDto {
	name: string;
	location: string;
	capabilityId: number;
	bandId: number;
	closingDate: string;
	description?: string;
	sharepointUrl?: string;
	responsibilities?: string[];
	numberOfOpenPositions?: number;
}
