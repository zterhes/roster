import { createPlayer, getAllPlayers, updatePlayer } from "@/db";
import { NextResponse, type NextRequest } from "next/server";
import { put } from "@vercel/blob";
import { PersistationErrorType, PersistationError } from "@/types/Errors";
import { createPlayerRequestSchema } from "@/types/Player";
import { ZodError } from "zod";
import env from "@/env";

export const POST = async (req: NextRequest) => {
	try {
		const formData = await req.formData();

		const { firstName, lastName, file } = createPlayerRequestSchema.parse({
			firstName: formData.get("firstName"),
			lastName: formData.get("lastName"),
			file: formData.get("file"),
		});

		let blobUrl: string = env.DEFAULT_IMAGE_URL;

		if (file) {
			const blob = await put(`${firstName}_${lastName}`, file, {
				access: "public",
			});
			if (blob) {
				blobUrl = blob.url;
			} else {
				throw new PersistationError(
					PersistationErrorType.BlobError,
					"Blob error",
				);
			}
		}

		const createResult = await createPlayer(firstName, lastName, blobUrl);

		return NextResponse.json({ userId: createResult.id }, { status: 200 });
	} catch (error) {
		console.error(error);
		if (error instanceof PersistationError) {
			return NextResponse.json({ status: 400, error: error.message });
		}
		if (error instanceof ZodError) {
			return NextResponse.json({
				status: 400,
				error: error.message.toString(),
			});
		}
		return NextResponse.json({ status: 500 });
	}
};

export const GET = async (req: NextRequest) => {
	const result = await getAllPlayers();
	return NextResponse.json(result, { status: 200 });
};
