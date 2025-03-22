import { NextResponse } from "next/server";
import { handleAuth } from "../../../../lib/auth";
import { handleError } from "@/lib/utils";
import { selectRosterByMatchId } from "@/db";
import { rosterResponseBodySchema } from "@/types/Roster";

export const GET = async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
	try {
		await handleAuth();
		const { id: matchId } = await params;
		const result = await selectRosterByMatchId(matchId);
		const parsedResult = result.map((roster) => {
			return rosterResponseBodySchema.parse({
				roster: {
					rosterId: roster.roster.id,
					playerId: roster.roster.playerId,
					positionId: roster.roster.positionId,
					matchId: roster.roster.matchId,
				},
				player: roster.players,
			});
		});

		const sortedResult = parsedResult.sort((prev, next) => prev.roster.positionId - next.roster.positionId);
		return NextResponse.json(sortedResult, { status: 200 });
	} catch (error) {
		return handleError(error);
	}
};
