import { z } from "zod";

export const createRosterRequestSchema = z.object({
	matchId: z.number(),
	players: z.array(
		z.object({
			playerId: z.number(),
			positionId: z.number(),
		}),
	),
});

export const getRosterResponseSchema = z.array(
	z.object({
		rosterId: z.number(),
		playerId: z.number(),
		positionId: z.number(),
		matchId: z.number(),
	}),
);

export const rosterDaoSchema = z.object({
	id: z.number().optional(),
	playerId: z.number(),
	positionId: z.number(),
	matchId: z.number(),
});

export type RosterDao = z.infer<typeof rosterDaoSchema>;

export type CreateRosterRequest = z.infer<typeof createRosterRequestSchema>;
