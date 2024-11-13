import { createPlayer, getAllPlayers, updatePlayer } from "@/db";
import { NextResponse, type NextRequest } from "next/server";
import { put } from "@vercel/blob";
import { DBError } from "@/types/Errors";
import { createPlayerRequestSchema } from "@/types/Player";
import { ZodError } from "zod";

export const POST = async (req: NextRequest) => {
	try {
		const formData = await req.formData();

		const { firstName, lastName, file } = createPlayerRequestSchema.parse({
			firstName: formData.get("firstName"),
			lastName: formData.get("lastName"),
			file: formData.get("file"),
		});

		const createResult = await createPlayer(firstName, lastName);

		if (file) {
			const blob = await put(createResult.id.toString(), file, {
				access: "public",
			});
			await updatePlayer({
				id: createResult.id,
				photoUrl: blob.url,
			});
		}

		return NextResponse.json({ userId: createResult.id }, { status: 200 });
	} catch (error) {
		console.error(error);
		if (error instanceof DBError) {
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
