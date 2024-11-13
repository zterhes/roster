import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { updatePlayerRequestSchema } from "@/types/Player";
import { updatePlayer } from "@/db";

import { PersistationError } from "@/types/Errors";
import { uploadToBlob } from "../utils/blob";

export const POST = async (
	req: Request,
	{ params }: { params: { id: string } },
) => {
	try {
		const { id } = params;
		const formData = await req.formData();

		const request = updatePlayerRequestSchema.parse({
			id: Number(id),
			firstName: formData.get("firstName"),
			lastName: formData.get("lastName"),
			file: formData.get("file"),
		});

		let blobUrl: string | undefined = undefined;
		if (request.file) {
			blobUrl = await uploadToBlob({
				firstName: request.firstName,
				lastName: request.lastName,
				file: request.file,
			});
		}

		await updatePlayer({
			id: request.id,
			firstName: request.firstName,
			lastName: request.lastName,
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
