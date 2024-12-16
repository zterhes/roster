import { createPlayer, getAllPlayers, getDefaultImages } from "@/db";
import { createPlayerRequestSchema } from "@/types/Player";
import { type NextRequest, NextResponse } from "next/server";
import { uploadToBlob } from "../utils/blob";
import { handleError } from "@/lib/utils";
import { handleAuth } from "../utils/auth";
import { PersistationError, PersistationErrorType } from "@/types/Errors";
import { or } from "drizzle-orm";
export const POST = async (req: NextRequest) => {
	try {
		const { organizationId } = await handleAuth(true);
		const formData = await req.formData();

		const { firstName, lastName, file } = createPlayerRequestSchema.parse({
			firstName: formData.get("firstName"),
			lastName: formData.get("lastName"),
			file: formData.get("file"),
		});

		let blobUrl: string;
		if (file) {
			blobUrl = await uploadToBlob({
				fileName: `${firstName}_${lastName}`,
				file,
			});
		} else {
			const defaultImages = await getDefaultImages(organizationId as string);
			if (defaultImages.playerUrl) blobUrl = defaultImages.playerUrl;
			else throw new PersistationError(PersistationErrorType.NotFound, "No default player image found");
		}

		const createResult = await createPlayer(firstName, lastName, blobUrl, organizationId as string);

		return NextResponse.json({ userId: createResult.id }, { status: 200 });
	} catch (error) {
		return handleError(error);
	}
};

export const GET = async () => {
	try {
		const { organizationId } = await handleAuth(true);
		const result = await getAllPlayers(organizationId as string);
		return NextResponse.json(result, { status: 200 });
	} catch (error) {
		return handleError(error);
	}
};
