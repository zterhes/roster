import { PersistationError, PersistationErrorType } from "@/types/Errors";
import { put } from "@vercel/blob";

type Blob = {
	firstName: string;
	lastName: string;
	file: File;
};

export const uploadToBlob = async (request: Blob) => {
	const blob = await put(`${request.firstName}_${request.lastName}`, request.file, {
		access: "public",
	});
	if (!blob) {
		throw new PersistationError(PersistationErrorType.BlobError, "Failed to upload file to blob");
	}

	return blob.url;
};
