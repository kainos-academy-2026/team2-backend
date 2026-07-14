export interface CvUploadUrlInput {
	key: string;
	contentType: string;
}

export interface CvUploadUrlResponse {
	cvKey: string;
	uploadUrl: string;
}

export default interface CvStorage {
	createCvUploadUrl(input: CvUploadUrlInput): Promise<CvUploadUrlResponse>;
	getCvUrl(cvKey: string): string;
}
