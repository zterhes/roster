import { PersistationError, PersistationErrorType } from "@/types/Errors";
import { del, put } from "@vercel/blob";

type Blob = {
	fileName: string;
	file: File;
};

export const uploadToBlob = async (request: Blob) => {
	console.log("request", request);
	const blob = await put(request.fileName, request.file, {
		access: "public",
	});
	if (!blob) {
		throw new PersistationError(PersistationErrorType.BlobError, "Failed to upload file to blob");
	}

	return blob.url;
};

export const deleteFromBlob = async (url: string) => {
	console.log("url", url);
	await del(url);
};
