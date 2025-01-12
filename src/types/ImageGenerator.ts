import { z } from "zod";
import { playerSchema } from "./Player";
import { rosterDaoSchema, rosterSchema } from "./Roster";
import { Image } from "canvas";

export const playerDtoSchema = z.object({
	player: playerSchema,
	roster: rosterSchema,
	image: z.instanceof(Image),
	buffer: z.instanceof(Buffer),
});

export type PlayerDto = z.infer<typeof playerDtoSchema>;

export const createPlayerDivOverlayDtoSchema = z.object({
	startX: z.number(),
	startY: z.number(),
	player: playerDtoSchema,
	playerDivWidth: z.number(),
	playerDivHeight: z.number(),
	playerDivNameFieldHight: z.number(),
	index: z.number(),
	horizontalSpacing: z.number(),
	verticalSpacing: z.number(),
	playersInRow: z.number(),
});

export type CreatePlayerDivOverlayDto = z.infer<typeof createPlayerDivOverlayDtoSchema>;
