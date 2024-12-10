import { NextResponse } from "next/server";
import { handleAuth } from "../../utils/auth";
import { handleError } from "@/lib/utils";
import { rosterTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/db";

export const GET = async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
	try {
		await handleAuth();
		const { id: matchId } = await params;
		const result = await db
			.select()
			.from(rosterTable)
			.where(eq(rosterTable.matchId, Number(matchId)));
		const parsedResult = result.map((roster) => {
			return {
				rosterId: roster.id,
				playerId: roster.playerId,
				positionId: roster.positionId,
				matchId: roster.matchId,
			};
		});
		return NextResponse.json(parsedResult, { status: 200 });
	} catch (error) {
		return handleError(error);
	}
};
