import { z } from "zod";
import { fileSchema } from "./File";
export const createMatchFormSchema = z.object({
	homeTeam: z.string(),
	homeTeamLogo: fileSchema,
	awayTeam: z.string(),
	awayTeamLogo: fileSchema,
	place: z.string(),
	date: z.date(),
});

export type CreateMatchFormValues = z.infer<typeof createMatchFormSchema>;

export const createMatchRequestSchema = z.object({
	homeTeam: z.string(),
	homeTeamLogo: fileSchema,
	awayTeam: z.string(),
	awayTeamLogo: fileSchema,
	place: z.string(),
	date: z.coerce.date(),
});

export const updateMatchRequestSchema = createMatchRequestSchema.partial();

export type CreateMatchRequestValues = z.infer<typeof createMatchRequestSchema>;

export type UpdateMatchRequestValues = z.infer<typeof updateMatchRequestSchema>;

export const teamSchema = z.object({
	name: z.string(),
	logoUrl: z.string(),
});

export const matchSchema = z.object({
	id: z.number(),
	homeTeam: teamSchema,
	awayTeam: teamSchema,
	place: z.string(),
	date: z.coerce.date(),
});

export type Match = z.infer<typeof matchSchema>;

export const matchesSchema = z.array(matchSchema);
