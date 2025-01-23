import { handleError } from "@/lib/utils";
import { handleAuth } from "../../../lib/auth";
import { type NextRequest, NextResponse } from "next/server";
import { createRosterRequestSchema, type RosterDao, rosterDaoSchema } from "@/types/Roster";
import { db } from "@/db";
import { matchesTable, rosterTable } from "@/db/schema";
import { PersistationError, PersistationErrorType } from "@/types/Errors";
import { rosterEnum } from "@/types/Match";
import { eq } from "drizzle-orm";

export const POST = async (req: NextRequest) => {
	try {
		await handleAuth(true);
		const request = createRosterRequestSchema.parse(await req.json());
		const daoList = request.players.map((player) => {
			return rosterDaoSchema.parse({
				matchId: request.matchId,
				playerId: player.playerId,
				positionId: player.positionId,
			});
		});

		await db
			.transaction(async (tx) => {
				const select = await tx.select().from(rosterTable).where(eq(rosterTable.matchId, request.matchId));
				const changedIds = findDifferencies(select, daoList);
				let result: { id: number }[] = [];
				if (changedIds.length > 0) {
					for (const update of changedIds) {
						const response = await tx
							.update(rosterTable)
							.set({ playerId: update.playerId })
							.where(eq(rosterTable.id, update.id))
							.returning({ id: rosterTable.id });
						result.push(response[0]);
					}
				} else {
					if (select.length > 0) {
						tx.rollback();
					}
					result = await tx.insert(rosterTable).values(daoList).returning({ id: rosterTable.id });
					if (result === null) tx.rollback();
				}
			})
			.catch(() => {
				throw new PersistationError(PersistationErrorType.CreateError, "Roster already exists, transaction failed");
			});

		const result = await db
			.update(matchesTable)
			.set({ rosterStatus: rosterEnum.Values.saved })
			.where(eq(matchesTable.id, request.matchId))
			.returning({ id: matchesTable.id });
		PersistationError.handleError(result[0], PersistationErrorType.UpdateError, "Failed to update match");
		return NextResponse.json({ status: 200 });
	} catch (error) {
		return handleError(error);
	}
};
function findDifferencies(
	select: { matchId: number; playerId: number; positionId: number; id: number }[],
	daoList: RosterDao[],
) {
	const sortedDaoList = daoList.sort((a, b) => a.positionId - b.positionId);
	const sortedSelect = select.sort((a, b) => a.positionId - b.positionId);

	return sortedSelect
		.map((roster, index) => {
			if (roster.playerId !== sortedDaoList[index].playerId) {
				return {
					playerId: sortedDaoList[index].playerId,
					id: roster.id,
				};
			}
		})
		.filter((player) => player !== undefined);
}
