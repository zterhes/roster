import { drizzle } from "drizzle-orm/vercel-postgres";
import { playersTable } from "./schema";
import { DBError, DBErrorType } from "@/types/Errors";
import { eq } from "drizzle-orm";
import env from "@/env";
import type { UpdatePlayerDto } from "@/types/Player";

const db = drizzle();

export const createPlayer = async (
	firstName: string,
	lastName: string,
): Promise<{ id: number }> => {
	const defaultUrl: string = env.DEFAULT_IMAGE_URL;
	const result = await db
		.insert(playersTable)
		.values({ firstName, lastName, photoUrl: defaultUrl })
		.returning({
			id: playersTable.id,
		});
	if (result[0].id == null)
		throw new DBError(DBErrorType.FailedToCreateUser, "Failed to create user");
	return result[0];
};

export const updatePlayer = async (
	player: UpdatePlayerDto,
): Promise<{ id: number }> => {
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
	if (result[0].id == null)
		throw new DBError(DBErrorType.FailedToCreateUser, "Failed to create user");
	return result[0];
};

export const getAllPlayers = async () => {
	const result = await db.select().from(playersTable);
	return result;
};
