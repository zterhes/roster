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
import { generatedImagesTable, playersTable, rosterTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { type GetPlayerByRoster, getPlayerByRosterSchema } from "@/types/Roster";
import { deleteFromBlob, uploadToBlob } from "@/lib/blob";
import { rosterPostImageGenerator, rosterStoryImageGenerator } from "@/lib/imageGenerators";
import type { GeneratedImageType } from "@/types/GeneratedImage";

export const GET = async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
	try {
		const { organizationId } = await handleAuth(true);

		const { id: matchId } = await params;

		const defaultImages = await getDefaultImages(organizationId as string);
		if (!defaultImages.playerUrl || !defaultImages.postUrl || !defaultImages.storyUrl) {
			throw new PersistationError(PersistationErrorType.NotFound, "No default images found for this organization");
		}

		const [buffers, tempRoster, match] = await Promise.all([
			downloadImages(defaultImages.storyUrl, defaultImages.postUrl),
			getRoster(matchId),
			selectMatchByMatchId(organizationId as string, matchId),
		]);

		let roster = tempRoster; // needed because of crying linter

		roster = roster.sort((a, b) => a.roster.positionId - b.roster.positionId);
		const [storyImageBuffer, postImageBuffer] = await Promise.all([
			await rosterStoryImageGenerator(buffers.story, roster, match),
			await rosterPostImageGenerator(buffers.post, roster, match),
		]);
		const [storyImageUrl, postImageUrl] = await Promise.all([
			uploadToBlob({ file: storyImageBuffer, fileName: "story_roster_image" }),
			uploadToBlob({ file: postImageBuffer, fileName: "post_roster_image" }),
		]);

		await Promise.all([
			updateImageTable(matchId, storyImageUrl, "story_roster_image"),
			updateImageTable(matchId, postImageUrl, "post_roster_image"),
		]);

		return NextResponse.json({ status: 200 });
	} catch (error) {
		return handleError(error);
	}
};

const updateImageTable = async (matchId: string, imageUrl: string, type: GeneratedImageType) => {
	const result = await db
		.update(generatedImagesTable)
		.set({ imageUrl: imageUrl, status: "generated", updatedAt: new Date() })
		.where(and(eq(generatedImagesTable.type, type), eq(generatedImagesTable.matchId, Number(matchId))))
		.returning({
			id: generatedImagesTable.id,
		});

	if (result.length === 0) {
		await deleteFromBlob(imageUrl);
		throw new PersistationError(PersistationErrorType.CreateError, `Error creating ${type} image`);
	}
};

const getRoster = async (matchId: string): Promise<GetPlayerByRoster[]> => {
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
