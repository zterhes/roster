import { z } from "zod";
import { playerSchema } from "./Player";

export const createRosterRequestSchema = z.object({
	matchId: z.number(),
	players: z.array(
		z.object({
			playerId: z.number(),
			positionId: z.number(),
		}),
	),
});

export const rosterSchema = z.object({
	rosterId: z.number(),
	playerId: z.number(),
	positionId: z.number(),
	matchId: z.number(),
});

export const getRosterResponseSchema = z.array(rosterSchema);

export const getPlayerByRosterSchema = z.object({
	roster: rosterSchema,
	player: playerSchema,
});

export type GetPlayerByRoster = z.infer<typeof getPlayerByRosterSchema>;

export const rosterDaoSchema = z.object({
	id: z.number().optional(),
	playerId: z.number(),
	positionId: z.number(),
	matchId: z.number(),
});

export type RosterDao = z.infer<typeof rosterDaoSchema>;

export type CreateRosterRequest = z.infer<typeof createRosterRequestSchema>;
