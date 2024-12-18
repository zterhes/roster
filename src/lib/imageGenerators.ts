import type { Match } from "@/types/Match";
import type { GetPlayerByRoster } from "@/types/Roster";
import { createCanvas } from "canvas";
import { format } from "date-fns";
import sharp from "sharp";

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
	fontSize: 39,
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

export const rosterStoryImageGenerator = async (
	storyBackgroundBuffer: Buffer,
	roster: GetPlayerByRoster[],
	match: Match,
) => {
	const overlayBuffers: Overlay[] = [];
	for (let index = 0; index < roster.length; index++) {
		const { buffer: textOverlayFN, textWidth } = createTextOverlay(
			roster[index].player.firstName,
			true,
			sizes.fontPadding,
			sizes.fontSize,
		);
		const { buffer: textOverlayLN } = createTextOverlay(
			roster[index].player.lastName,
			false,
			sizes.fontPadding,
			sizes.fontSize,
		);
		const { buffer: textOverlayPos, textWidth: posTextWidth } = createTextOverlay(
			`${roster[index].roster.positionId + 1}.`,
			false,
			sizes.fontPadding,
			sizes.fontSize,
		);
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

	const matchDataPosition = staringHigh.starter + numberOfStarters * sizes.textRowDivHigh + sizes.textRowDivHigh * 3;

	const { dateTimeOverlay, dateWidth, placeOverlay, placeWidth } = createMatchDataOverlay(match, 10, 55);
	overlayBuffers.push({
		input: dateTimeOverlay,
		top: matchDataPosition,
		left: textCenter(dateWidth, imageSize.story.width),
	});
	overlayBuffers.push({
		input: placeOverlay,
		top: matchDataPosition + sizes.textRowDivHigh,
		left: textCenter(placeWidth, imageSize.story.width),
	});

	const storyImageBuffer = await sharp(storyBackgroundBuffer).composite(overlayBuffers).png().toBuffer();
	return new File([storyImageBuffer], "story.png", { type: "image/png" });
};

const textCenter = (textWidth: number, divWidth: number) => {
	const divCenterPoint = divWidth / 2;
	return Math.ceil(divCenterPoint - textWidth / 2);
};

const createMatchDataOverlay = (match: Match, padding: number, fontSize: number) => {
	const date = format(match.date, "yyyy/MM/dd hh:mm");
	console.log("date", date);
	const { buffer: dateTimeOverlay, textWidth: dateWidth } = createTextOverlay(date, false, padding, fontSize);

	const { buffer: placeOverlay, textWidth: placeWidth } = createTextOverlay(
		match.place.toUpperCase(),
		false,
		padding,
		fontSize,
	);

	return {
		dateTimeOverlay,
		dateWidth,
		placeOverlay,
		placeWidth,
	};
};

const createTextOverlay = (text: string, isFirstName: boolean, padding: number, fontSize: number) => {
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
