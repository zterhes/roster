import { ClientServerCallError, ClientServerCallErrorType, GeneratorError, GeneratorErrorType } from "@/types/Errors";
import { type CreatePlayerDivOverlayDto, createPlayerDivOverlayDtoSchema } from "@/types/ImageGenerator";
import type { Match } from "@/types/Match";
import type { GetPlayerByRoster } from "@/types/Roster";
import { createCanvas, loadImage, registerFont } from "canvas";
import { format } from "date-fns";
import sharp from "sharp";

registerFont("src/lib/VV2Nightclub.otf", { family: "CustomFont" });

const imageSize = {
	post: { width: 1200, height: 630 },
	story: { width: 1080, height: 1920 },
};

const staringHigh = {
	starter: 160,
	bench: 500,
};

const numberOfStarters = 15;

const sizes = {
	textRowDivHigh: 60,
	fontSize: {
		story: {
			playerMaximum: 39,
		},
		roster: {
			playerMaximum: 10,
		},
		matchData: 80,
	},
	horzontalPaddingBetweenTexts: 10,
	fontPadding: 10,
	divHorizontalLeftPadding: {
		starter: 80,
		bench: 605,
	},
};

type Overlay = {
	input: Buffer;
	top: number;
	left: number;
};

export const rosterPostImageGenerator = async (
	rosterBackgroundBuffer: Buffer,
	roster: GetPlayerByRoster[],
	match: Match,
) => {
	const overlayBuffers: Overlay[] = [];

	//positioning match data
	const dateY = Math.ceil(imageSize.post.height * 0.4); //40% from top
	const placeY = Math.ceil(imageSize.post.height * 0.5); //50% from top

	const { dateTimeOverlay, dateWidth, placeOverlay, placeWidth } = createMatchDataOverlay(
		match,
		sizes.fontPadding,
		Math.ceil(imageSize.post.width * 0.04), //4% of width
	);
	overlayBuffers.push({
		input: dateTimeOverlay,
		top: dateY,
		left: imageSize.post.width / 2,
	});
	overlayBuffers.push({
		input: placeOverlay,
		top: placeY,
		left: imageSize.post.width / 2 + textCenter(placeWidth, dateWidth),
	});

	//Pulling loading player images
	const playerDataArr = await Promise.all(roster.map((player) => pullPlayerImage(player)));

	const playerImageArrWithLoadedImages = await Promise.all(
		playerDataArr.map(async (player) => {
			return { ...player, image: await loadImage(player.buffer) };
		}),
	).catch((error) => {
		throw new GeneratorError(GeneratorErrorType.LoadingError, error.message);
	});

	//calculating player divisions
	//to-do: fix this to getting data from configuration
	const playerDivWidth = Math.floor(imageSize.post.width * 0.05); //5% of width
	const playerDivHeight = Math.floor(imageSize.post.height * 0.15); //15% of height
	const playerDivNameFieldHight = Math.floor(playerDivHeight * 0.25); //25% of height
	const horizontalSpacing = imageSize.post.width * 0.01; // 2% spacing
	const verticalSpacing = imageSize.post.height * 0.01; // 7% spacing
	const startX = imageSize.post.width * 0.07; // Start 8% padding from left
	const startY = imageSize.post.height * 0.1; // Start 13% down from the top
	const startXForBench = startX + imageSize.post.width * 0.25; // Start 25% padding from the starters
	const starterPlayersInRow = 3;
	const benchPlayersInRow = 4;

	const [starterImageGroup, benchImageGroup] = await Promise.all([
		playerImageArrWithLoadedImages.slice(0, numberOfStarters).map((player, index) => {
			const dto = createPlayerDivOverlayDtoSchema.parse({
				startX,
				startY,
				player,
				playerDivWidth,
				playerDivHeight,
				playerDivNameFieldHight,
				index,
				horizontalSpacing,
				verticalSpacing,
				playersInRow: starterPlayersInRow,
			});

			return createPlayerDivOverlay(dto);
		}),
		playerImageArrWithLoadedImages.slice(numberOfStarters, playerDataArr.length).map((player, index) => {
			const dto = createPlayerDivOverlayDtoSchema.parse({
				startX: startXForBench,
				startY,
				player,
				playerDivWidth,
				playerDivHeight,
				playerDivNameFieldHight,
				index,
				horizontalSpacing,
				verticalSpacing,
				playersInRow: benchPlayersInRow,
			});
			return createPlayerDivOverlay(dto);
		}),
	]);

	overlayBuffers.push(...starterImageGroup);
	overlayBuffers.push(...benchImageGroup);

	const rosterImageBuffer = await sharp(rosterBackgroundBuffer).composite(overlayBuffers).png().toBuffer();
	return new File([rosterImageBuffer], "roster.png", { type: "image/png" });
};

const createPlayerDivOverlay = (dto: CreatePlayerDivOverlayDto) => {
	const canvas = createCanvas(dto.playerDivWidth, dto.playerDivHeight);
	const ctx = canvas.getContext("2d");
	const row = Math.floor(dto.index / dto.playersInRow); // configured number of players per row
	const col = Math.floor(dto.index % dto.playersInRow);

	const x = Math.ceil(dto.startX + col * (dto.playerDivWidth + dto.horizontalSpacing));
	const y = Math.ceil(dto.startY + row * (dto.playerDivHeight + dto.verticalSpacing));

	ctx.drawImage(dto.player.image, 0, 0, dto.playerDivWidth, dto.playerDivHeight - dto.playerDivNameFieldHight);

	ctx.fillStyle = "#004aad";
	ctx.fillRect(
		0,
		0 + (dto.playerDivHeight - dto.playerDivNameFieldHight),
		dto.playerDivWidth,
		dto.playerDivNameFieldHight,
	);

	ctx.fillStyle = "#ffffff";
	const calculatedFontSize = calculateFontSize(dto.player.player.lastName, dto.playerDivWidth);
	const fontSize =
		calculatedFontSize > sizes.fontSize.roster.playerMaximum ? sizes.fontSize.roster.playerMaximum : calculatedFontSize;
	ctx.font = `bold ${fontSize}px arial`;
	ctx.textBaseline = "middle";
	ctx.textAlign = "center";
	ctx.fillText(
		dto.player.player.lastName,
		dto.playerDivWidth / 2,
		dto.playerDivHeight - dto.playerDivNameFieldHight / 2,
	);

	return {
		input: canvas.toBuffer(),
		top: y,
		left: x,
	};
};

const calculateFontSize = (text: string, maxWidth: number) => {
	const fontSize = Math.ceil((maxWidth / text.length) * 0.95);
	return fontSize;
};

const pullPlayerImage = async (player: GetPlayerByRoster) => {
	const playerImage = await fetch(player.player.photoUrl);
	if (!playerImage.ok) {
		throw new ClientServerCallError(
			ClientServerCallErrorType.AxiosError,
			"/api/image-generator#pullPlayerImage",
			"Error downloading player image",
		);
	}
	const playerImageBuffer = await playerImage.arrayBuffer();
	return {
		...player,
		buffer: Buffer.from(playerImageBuffer),
	};
};

export const rosterStoryImageGenerator = async (
	storyBackgroundBuffer: Buffer,
	roster: GetPlayerByRoster[],
	match: Match,
) => {
	const overlayBuffers: Overlay[] = [];

	//creating and positioning player overlays
	for (let index = 0; index < roster.length; index++) {
		//creating text overlays
		const { buffer: textOverlayFN, textWidth } = createTextOverlay(
			roster[index].player.firstName,
			true,
			sizes.fontPadding,
			sizes.fontSize.story.playerMaximum,
		);
		const { buffer: textOverlayLN } = createTextOverlay(
			roster[index].player.lastName,
			false,
			sizes.fontPadding,
			sizes.fontSize.story.playerMaximum,
		);
		const { buffer: textOverlayPos, textWidth: posTextWidth } = createTextOverlay(
			`${roster[index].roster.positionId + 1}.`,
			false,
			sizes.fontPadding,
			sizes.fontSize.story.playerMaximum,
		);

		//overlay positioning
		if (index < numberOfStarters) {
			overlayBuffers.push({
				input: textOverlayPos,
				top: staringHigh.starter + index * sizes.textRowDivHigh,
				left: sizes.divHorizontalLeftPadding.starter,
			});
			overlayBuffers.push({
				input: textOverlayFN,
				top: staringHigh.starter + index * sizes.textRowDivHigh,
				left: sizes.divHorizontalLeftPadding.starter + Math.ceil(posTextWidth),
			});
			overlayBuffers.push({
				input: textOverlayLN,
				top: staringHigh.starter + index * sizes.textRowDivHigh,
				left:
					sizes.divHorizontalLeftPadding.starter +
					Math.ceil(textWidth + posTextWidth) +
					sizes.horzontalPaddingBetweenTexts,
			});
		} else {
			overlayBuffers.push({
				input: textOverlayPos,
				top: staringHigh.bench + (index - numberOfStarters) * sizes.textRowDivHigh,
				left: sizes.divHorizontalLeftPadding.bench,
			});
			overlayBuffers.push({
				input: textOverlayFN,
				top: staringHigh.bench + (index - numberOfStarters) * sizes.textRowDivHigh,
				left: sizes.divHorizontalLeftPadding.bench + Math.ceil(posTextWidth),
			});
			overlayBuffers.push({
				input: textOverlayLN,
				top: staringHigh.bench + (index - numberOfStarters) * sizes.textRowDivHigh,
				left:
					sizes.divHorizontalLeftPadding.bench +
					Math.ceil(textWidth + posTextWidth) +
					sizes.horzontalPaddingBetweenTexts,
			});
		}
	}

	//creating and positioning match data
	const matchDataPosition = staringHigh.starter + numberOfStarters * sizes.textRowDivHigh + sizes.textRowDivHigh * 2;

	const { dateTimeOverlay, dateWidth, placeOverlay, placeWidth } = createMatchDataOverlay(
		match,
		sizes.fontPadding,
		sizes.fontSize.matchData,
	);
	overlayBuffers.push({
		input: dateTimeOverlay,
		top: matchDataPosition,
		left: textCenter(dateWidth, imageSize.story.width),
	});
	overlayBuffers.push({
		input: placeOverlay,
		top: matchDataPosition + sizes.textRowDivHigh + 20,
		left: textCenter(placeWidth, imageSize.story.width),
	});

	//generate final image
	const storyImageBuffer = await sharp(storyBackgroundBuffer).composite(overlayBuffers).png().toBuffer();
	return new File([storyImageBuffer], "story.png", { type: "image/png" });
};

/**
 * Calculates the x-coordinate of a text overlay so it is centered within a div.
 * @param {number} textWidth - The width of the text overlay.
 * @param {number} divWidth - The width of the div.
 * @returns {number} The x-coordinate for the text overlay.
 */
const textCenter = (textWidth: number, divWidth: number) => {
	const divCenterPoint = divWidth / 2;
	return Math.ceil(divCenterPoint - textWidth / 2);
};

const createMatchDataOverlay = (match: Match, padding: number, fontSize: number) => {
	const date = format(match.date, "yyyy/MM/dd hh:mm");
	const { buffer: dateTimeOverlay, textWidth: dateWidth } = createTextOverlay(date, false, padding, fontSize, true);

	const { buffer: placeOverlay, textWidth: placeWidth } = createTextOverlay(
		match.place.toUpperCase(),
		false,
		padding,
		fontSize,
		true,
	);

	return {
		dateTimeOverlay,
		dateWidth,
		placeOverlay,
		placeWidth,
	};
};

const createTextOverlay = (
	text: string,
	isFirstName: boolean,
	padding: number,
	fontSize: number,
	isMatchData?: boolean,
) => {
	const font = isMatchData ? `bold ${fontSize}px CustomFont` : `bold ${fontSize}px Open Sans`;
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
