import { z } from "zod";

export const postMessageSchema = z.object({
	message: z.string(),
	imageId: z.string(),
});

export type PostMessageBody = z.infer<typeof postMessageSchema>;

export const facebookPostToFeedRequestSchema = z.object({
	url: z.string(),
	message: z.string(),
	published: z.boolean(),
	scheduled_publish_time: z.number().optional(),
});

export const facebookPostToFeedResponseSchema = z.object({
	id: z.string(),
	post_id: z.string().optional(),
});

export const facebookPostToStoryRequestSchema = z.object({
	photo_id: z.string(),
	published: z.boolean(),
	scheduled_publish_time: z.number().optional(),
});
