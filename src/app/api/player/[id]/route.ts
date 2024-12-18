import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { updatePlayerRequestSchema } from "@/types/Player";
import { updatePlayer } from "@/db";

import { PersistationError } from "@/types/Errors";
import { uploadToBlob } from "../../../../lib/blob";
import { handleAuth } from "../../../../lib/auth";

export const POST = async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
	try {
		await handleAuth();
		const { id } = await params;
		const formData = await request.formData();

		const requestData = updatePlayerRequestSchema.parse({
			id: Number(id),
			firstName: formData.get("firstName"),
			lastName: formData.get("lastName"),
			file: formData.get("file"),
		});

		let blobUrl: string | undefined = undefined;
		if (requestData.file) {
			blobUrl = await uploadToBlob({
				fileName: `${requestData.firstName}_${requestData.lastName}`,
				file: requestData.file,
			});
		}

		await updatePlayer({
			id: requestData.id,
			firstName: requestData.firstName,
			lastName: requestData.lastName,
			photoUrl: blobUrl,
		});

		return NextResponse.json({ status: 200 });
	} catch (error) {
		console.error(error);
		if (error instanceof PersistationError) {
			return NextResponse.json({ status: 400, error: error.message });
		}
		if (error instanceof ZodError) {
			return NextResponse.json({ status: 400, error: error.message });
		}
	}
};
