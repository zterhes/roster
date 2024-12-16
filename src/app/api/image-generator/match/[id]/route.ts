import { handleAuth } from "@/app/api/utils/auth";
import { handleError } from "@/lib/utils";
import { NextResponse } from "next/server";
import { createCanvas } from "canvas";
import {
	ClientServerCallError,
	ClientServerCallErrorType,
	PersistationError,
	PersistationErrorType,
} from "@/types/Errors";
import { db, getAllPlayers, getDefaultImages, selectRosterByMatchId } from "@/db";
import { playersTable, rosterTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { type GetPlayerByRoster, getPlayerByRosterSchema, getRosterResponseSchema } from "@/types/Roster";
import sharp from "sharp";
import { uploadToBlob } from "@/app/api/utils/blob";

const imageSize = {
	post: { width: 1200, height: 630 },
	story: { width: 1080, height: 1920 },
};

type Overlay = {
	input: Buffer;
	top: number;
	left: number;
};

export const GET = async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
	try {
		const { organizationId } = await handleAuth(true);

		const { id: matchId } = await params;

		const defaultImages = await getDefaultImages(organizationId as string);
		if (!defaultImages.playerUrl || !defaultImages.postUrl || !defaultImages.storyUrl) {
			throw new PersistationError(PersistationErrorType.NotFound, "No default images found for this organization");
		}

		const [buffers, roster] = await Promise.all([
			downloadImages(defaultImages.storyUrl, defaultImages.postUrl),
			getRoster(matchId, organizationId as string),
		]);

		const imageBuffer = await generateImages(buffers.story, buffers.post, roster);
		const blobUrl = await uploadToBlob({
			file: imageBuffer,
			fileName: "generated-image",
		});

		console.log("bloburl", blobUrl);

		return NextResponse.json({ status: 200 });
	} catch (error) {
		return handleError(error);
	}
};

const generateImages = async (
	storyBackgroundBuffer: Buffer<ArrayBufferLike>,
	postBackgroundBuffer: Buffer<ArrayBufferLike>,
	roster: GetPlayerByRoster[],
) => {
	const overlayBuffers: Overlay[] = [];
	const textOverlay = createTextOverlay("Hello World", imageSize.story.width, imageSize.story.height);
	overlayBuffers.push({ input: textOverlay, top: 200, left: 50 });
	const storyImageBuffer = await sharp(storyBackgroundBuffer).composite(overlayBuffers).png().toBuffer();
	return new File([storyImageBuffer], "story.png", { type: "image/png" });
};

const getRoster = async (matchId: string, organizationId: string): Promise<GetPlayerByRoster[]> => {
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

const createTextOverlay = (text: string, width: number, height: number): Buffer => {
	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext("2d");

	ctx.fillStyle = "white";
	ctx.font = "42.56px Arial";
	ctx.fillText(text, 10, 30);

	return canvas.toBuffer();
};
