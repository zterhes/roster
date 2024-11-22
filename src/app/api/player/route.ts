import { createPlayer, getAllPlayers } from "@/db";
import env from "@/env";
import { createPlayerRequestSchema } from "@/types/Player";
import { type NextRequest, NextResponse } from "next/server";
import { uploadToBlob } from "../utils/blob";
import { handleError } from "@/lib/utils";
import { handleAuth } from "../utils/auth";
import { clerkClient } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";

export const POST = async (req: NextRequest) => {
	try {
		await handleAuth();
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
		return handleError(error);
	}
};

export const GET = async () => {
	try {
		await handleAuth();
		const result = await getAllPlayers();
		return NextResponse.json(result, { status: 200 });
	} catch (error) {
		return handleError(error);
	}
};
