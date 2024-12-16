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
import { db, getDefaultImages } from "@/db";
import { playersTable, rosterTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { type GetPlayerByRoster, getPlayerByRosterSchema, getRosterResponseSchema } from "@/types/Roster";
import sharp from "sharp";
import { uploadToBlob } from "@/app/api/utils/blob";

const imageSize = {
	post: { width: 1200, height: 630 },
	story: { width: 1080, height: 1920 },
};

const numberOfStarters = 15;

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

		let [buffers, roster] = await Promise.all([
			downloadImages(defaultImages.storyUrl, defaultImages.postUrl),
			getRoster(matchId, organizationId as string),
		]);
		roster = roster.sort((a, b) => a.roster.positionId - b.roster.positionId);
		const imageBuffer = await generateImages(buffers.story, buffers.post, roster);
		const blobUrl = await uploadToBlob({
			file: imageBuffer,
			fileName: "story_roster_image",
		});

		console.log("bloburl", blobUrl);

		return NextResponse.json({ status: 200 });
	} catch (error) {
		return handleError(error);
	}
};

const generateImages = async (
	storyBackgroundBuffer: Buffer<ArrayBufferLike>,
	_postBackgroundBuffer: Buffer<ArrayBufferLike>,
	roster: GetPlayerByRoster[],
) => {
	const overlayBuffers: Overlay[] = [];
	const staringHigh = {
		starter: 172,
		bench: 500,
	};
	const paddingBetweenTexts = 10;
	for (let index = 0; index < roster.length; index++) {
		const { buffer: textOverlayFN, textWidth } = createTextOverlay(roster[index].player.firstName, true, 10);
		const { buffer: textOverlayLN } = createTextOverlay(roster[index].player.lastName, false, 10);
		const { buffer: textOverlayPos, textWidth: posTextWidth } = createTextOverlay(
			`${roster[index].roster.positionId + 1}.`,
			false,
			10,
		);
		if (index < numberOfStarters) {
			overlayBuffers.push({ input: textOverlayPos, top: staringHigh.starter + index * 60, left: 80 });
			overlayBuffers.push({
				input: textOverlayFN,
				top: staringHigh.starter + index * 60,
				left: 80 + Math.ceil(posTextWidth),
			});
			overlayBuffers.push({
				input: textOverlayLN,
				top: staringHigh.starter + index * 60,
				left: 80 + Math.ceil(textWidth + posTextWidth) + paddingBetweenTexts,
			});
		} else {
			overlayBuffers.push({
				input: textOverlayPos,
				top: staringHigh.bench + (index - numberOfStarters) * 60,
				left: 605,
			});
			overlayBuffers.push({
				input: textOverlayFN,
				top: staringHigh.bench + (index - numberOfStarters) * 60,
				left: 605 + Math.ceil(posTextWidth),
			});
			overlayBuffers.push({
				input: textOverlayLN,
				top: staringHigh.bench + (index - numberOfStarters) * 60,
				left: 605 + Math.ceil(textWidth + posTextWidth) + paddingBetweenTexts,
			});
		}
	}

	const storyImageBuffer = await sharp(storyBackgroundBuffer).composite(overlayBuffers).png().toBuffer();
	return new File([storyImageBuffer], "story.png", { type: "image/png" });
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

const createTextOverlay = (text: string, isFirstName: boolean, padding: number) => {
	const fontSize = 43;
	const font = `bold ${fontSize}px Open Sans`;
	const tempCanvas = createCanvas(1, 1);
	const tempCtx = tempCanvas.getContext("2d");
	tempCtx.font = font;
	const textWidth = tempCtx.measureText(text).width;

	// Dynamically calculate canvas size
	const width = textWidth + padding * 2; // Add horizontal padding
	const height = fontSize + padding * 2; // Add vertical padding based on font size

	// Create the actual canvas
	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext("2d");

	if (isFirstName) {
		ctx.fillStyle = "#38b6ff";
	} else {
		ctx.fillStyle = "#ffffff";
	}
	ctx.font = font;

	// Draw text, centered with padding
	ctx.fillText(text, padding, fontSize + padding / 2);

	return { buffer: canvas.toBuffer(), textWidth };
};
