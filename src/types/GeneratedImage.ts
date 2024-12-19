import { z } from "zod";

export const generatedImageSchema = z.object({
	id: z.number(),
	imageUrl: z.string(),
	type: z.enum(["story_roster_image", "post_roster_image", "story_score_image", "post_score_image"]),
	status: z.enum(["generated", "posted", "not_generated"]),
	matchId: z.number(),
});

export type GeneratedImage = z.infer<typeof generatedImageSchema>;
