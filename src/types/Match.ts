import { z } from "zod";

export const createMatchFormSchema = z.object({
	homeTeam: z.string(),
	homeTeamLogo: z.instanceof(File).optional(),
	awayTeam: z.string(),
	awayTeamLogo: z.instanceof(File).optional(),
	place: z.string(),
	date: z.string(),
});

export type CreateMatchFormValues = z.infer<typeof createMatchFormSchema>;
