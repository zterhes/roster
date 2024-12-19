import { generatedImagesTable } from "@/db/schema";
import { handleAuth } from "@/lib/auth";
import { handleError } from "@/lib/utils";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { PersistationError, PersistationErrorType } from "@/types/Errors";

export const GET = async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
	try {
		await handleAuth(true);
		const { id } = await params;
		const result = await db
			.select()
			.from(generatedImagesTable)
			.where(eq(generatedImagesTable.matchId, Number(id)));

		if (result.length === 0) {
			throw new PersistationError(PersistationErrorType.NotFound, "No images found for this match");
		}
		return NextResponse.json(result, { status: 200 });
	} catch (error) {
		return handleError(error);
	}
};
