import { z } from "zod";
import { generatedImageTypeSchema } from "./GeneratedImage";

export const postMessageSchema = z.object({
	message: z.string(),
	type: generatedImageTypeSchema,
	imageId: z.string(),
});

export type PostMessageBody = z.infer<typeof postMessageSchema>;
