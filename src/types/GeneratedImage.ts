import { z } from "zod";

const generatedImageTypeSchema = z.enum([
	"story_roster_image",
	"post_roster_image",
	"story_score_image",
	"post_score_image",
]);

const generatedImageStatusSchema = z.enum(["generated", "posted", "not_generated"]);

export const generatedImageSchema = z.object({
	id: z.number(),
	imageUrl: z.string(),
	type: generatedImageTypeSchema,
	status: generatedImageStatusSchema,
	matchId: z.number(),
});

export type GeneratedImage = z.infer<typeof generatedImageSchema>;
export type GeneratedImageType = z.infer<typeof generatedImageTypeSchema>;
