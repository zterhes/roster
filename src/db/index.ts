import { drizzle } from "drizzle-orm/vercel-postgres";
import { defaultsTable, playersTable, rosterTable } from "./schema";
import { PersistationError, PersistationErrorType } from "@/types/Errors";
import { eq } from "drizzle-orm";
import type { UpdatePlayerDto } from "@/types/Player";

export const db = drizzle();

export const createPlayer = async (
	firstName: string,
	lastName: string,
	photoUrl: string,
	organizationId: string,
): Promise<{ id: number }> => {
	const result = await db.insert(playersTable).values({ firstName, lastName, photoUrl, organizationId }).returning({
		id: playersTable.id,
	});
	if (result[0]?.id == null) throw new PersistationError(PersistationErrorType.CreateError, "Failed to create user");
	return result[0];
};

export const updatePlayer = async (player: UpdatePlayerDto): Promise<{ id: number }> => {
	const result = await db
		.update(playersTable)
		.set({
			firstName: player.firstName,
			lastName: player.lastName,
			photoUrl: player.photoUrl,
		})
		.where(eq(playersTable.id, player.id))
		.returning({
			id: playersTable.id,
		});
	if (result[0]?.id == null) throw new PersistationError(PersistationErrorType.UpdateError, "Failed to update player");
	return result[0];
};

export const getAllPlayers = async (organizationId: string) => {
	const result = await db.select().from(playersTable).where(eq(playersTable.organizationId, organizationId));
	return result;
};

export const updateDefaultImages = async (organizationId: string, post?: string, story?: string, player?: string) => {
	let result = await db
		.update(defaultsTable)
		.set({ postUrl: post, storyUrl: story, playerUrl: player })
		.where(eq(defaultsTable.organizationId, organizationId))
		.returning({
			organizationId: defaultsTable.organizationId,
		});
	if (result[0]?.organizationId == null) {
		console.log("New Organization: Inserting Default Images");
		result = await db
			.insert(defaultsTable)
			.values({ organizationId, postUrl: post, storyUrl: story, playerUrl: player })
			.returning({
				organizationId: defaultsTable.organizationId,
			});
		if (result[0]?.organizationId == null)
			throw new PersistationError(PersistationErrorType.UpdateError, "Failed to update default images");
	}
	return result[0];
};

export const getDefaultImages = async (organizationId: string) => {
	const result = await db.select().from(defaultsTable).where(eq(defaultsTable.organizationId, organizationId));
	if (result.length === 0) throw new PersistationError(PersistationErrorType.NotFound, "No default images found");
	return result[0];
};

export const selectRosterByMatchId = async (matchId: string) => {
	const result = await db
		.select()
		.from(rosterTable)
		.where(eq(rosterTable.matchId, Number(matchId)));

	if (result.length === 0)
		throw new PersistationError(PersistationErrorType.NotFound, "No roster found to this match id");
	return result;
};
