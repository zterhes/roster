import { z } from "zod";
import { fileSchema } from "./File";

export const updateDefaultImagesRequestSchema = z.object({
	post: fileSchema.optional().nullable(),
	story: fileSchema.optional().nullable(),
	player: fileSchema.optional().nullable(),
});

export type UpdateDefaultImagesRequest = z.infer<typeof updateDefaultImagesRequestSchema>;

export const defaultImagesResponseSchema = z.object({
	post: z.string().url(),
	story: z.string().url(),
	player: z.string().url(),
});
