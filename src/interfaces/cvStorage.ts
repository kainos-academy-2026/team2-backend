import type {
	CvUploadUrlInputDto,
	CvUploadUrlResponseDto,
} from "../dtos/cvUploadUrlDto.js";

export default interface CvStorage {
	createCvUploadUrl(
		input: CvUploadUrlInputDto,
	): Promise<CvUploadUrlResponseDto>;
	getCvUrl(cvKey: string): string;
}
