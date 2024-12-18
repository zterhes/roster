import { handleAuth } from "@/lib/auth";
import { handleError } from "@/lib/utils";
import { NextResponse } from "next/server";
import {
	ClientServerCallError,
	ClientServerCallErrorType,
	PersistationError,
	PersistationErrorType,
} from "@/types/Errors";
import { db, getDefaultImages, selectMatchByMatchId } from "@/db";
import { playersTable, rosterTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { type GetPlayerByRoster, getPlayerByRosterSchema } from "@/types/Roster";
import { uploadToBlob } from "@/lib/blob";
import { rosterStoryImageGenerator } from "@/lib/imageGenerators";

export const GET = async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
	try {
		const { organizationId } = await handleAuth(true);

		const { id: matchId } = await params;

		const defaultImages = await getDefaultImages(organizationId as string);
		if (!defaultImages.playerUrl || !defaultImages.postUrl || !defaultImages.storyUrl) {
			throw new PersistationError(PersistationErrorType.NotFound, "No default images found for this organization");
		}

		let [buffers, roster, match] = await Promise.all([
			downloadImages(defaultImages.storyUrl, defaultImages.postUrl),
			getRoster(matchId, organizationId as string),
			selectMatchByMatchId(organizationId as string, matchId),
		]);

		roster = roster.sort((a, b) => a.roster.positionId - b.roster.positionId);
		const [storyImageBuffer] = await Promise.all([await rosterStoryImageGenerator(buffers.story, roster, match)]);
		const [storyImageUrl] = await Promise.all([
			uploadToBlob({ file: storyImageBuffer, fileName: "story_roster_image" }),
		]);

		console.log("storyImageUrl", storyImageUrl);

		return NextResponse.json({ status: 200 });
	} catch (error) {
		return handleError(error);
	}
};

const getRoster = async (matchId: string, _organizationId: string): Promise<GetPlayerByRoster[]> => {
	const result = await db
		.select()
		.from(rosterTable)
		.innerJoin(playersTable, eq(rosterTable.playerId, playersTable.id))
		.where(eq(rosterTable.matchId, Number(matchId)));
	if (result.length === 0)
		throw new PersistationError(PersistationErrorType.NotFound, "No roster found to this match id");

	return result.map((roster) => {
		return getPlayerByRosterSchema.parse({
			roster: {
				rosterId: roster.roster.id,
				playerId: roster.roster.playerId,
				positionId: roster.roster.positionId,
				matchId: roster.roster.matchId,
			},
			player: roster.players,
		});
	});
};

const downloadImages = async (story: string, post: string) => {
	const [sRes, pRes] = await Promise.all([fetch(story), fetch(post)]);
	if (!sRes.ok) {
		throw new ClientServerCallError(
			ClientServerCallErrorType.AxiosError,
			"/api/image-generator",
			"Error downloading story",
		);
	}
	if (!pRes.ok) {
		throw new ClientServerCallError(
			ClientServerCallErrorType.AxiosError,
			"/api/image-generator",
			"Error downloading post",
		);
	}
	const sArrbuff = await sRes.arrayBuffer();
	const pArrbuff = await pRes.arrayBuffer();
	return { story: Buffer.from(sArrbuff), post: Buffer.from(pArrbuff) };
};