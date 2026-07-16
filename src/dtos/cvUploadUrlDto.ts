export interface CvUploadUrlInputDto {
	key: string;
	contentType: string;
}

export interface CvUploadUrlResponseDto {
	cvKey: string;
	uploadUrl: string;
}
