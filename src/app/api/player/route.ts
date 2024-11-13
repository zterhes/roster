import { createPlayer, getAllPlayers } from "@/db";
import env from "@/env";
import { PersistationError } from "@/types/Errors";
import { createPlayerRequestSchema } from "@/types/Player";
import { type NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { uploadToBlob } from "../utils/blob";

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
			blobUrl = await uploadToBlob({
				firstName,
				lastName,
				file,
			});
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

export const GET = async () => {
	const result = await getAllPlayers();
	return NextResponse.json(result, { status: 200 });
};
