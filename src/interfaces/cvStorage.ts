export interface CvUploadInput {
	key: string;
	content: Buffer;
	contentType: string;
}

export default interface CvStorage {
	uploadCv(input: CvUploadInput): Promise<string>;
}
