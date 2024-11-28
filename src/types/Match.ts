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
	date: z.date(),
});

export type CreateMatchRequestValues = z.infer<typeof createMatchRequestSchema>;
