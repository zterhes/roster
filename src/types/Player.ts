import { z } from "zod";
import { fileSchema } from "./File";

export const playerSchema = z.object({
	id: z.number(),
	firstName: z.string(),
	lastName: z.string(),
	photoUrl: z.string(),
});

export type Player = z.infer<typeof playerSchema>;

export type UpdatePlayerDto = {
	id: number;
	firstName?: string;
	lastName?: string;
	photoUrl?: string;
};

export const createPlayerRequestSchema = z.object({
	firstName: z.string(),
	lastName: z.string(),
	file: fileSchema.optional().nullable(),
});

export type CreatePlayerRequest = z.infer<typeof createPlayerRequestSchema>;

export const createPlayerResponseSchema = z.object({
	userId: z.number(),
});

export const updatePlayerRequestSchema = z.object({
	id: z.number(),
	firstName: z.string(),
	lastName: z.string(),
	file: fileSchema.optional().nullable(),
});

export type UpdatePlayerRequest = z.infer<typeof updatePlayerRequestSchema>;
