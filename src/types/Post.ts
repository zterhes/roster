import { z } from "zod";

export const postMessageRequestSchema = z.object({
	message: z.string().optional(),
	imageId: z.number(),
	isPublishLater: z.boolean(),
	scheduledPublishTime: z.coerce.date().optional(),
});

export const postFormSchema = z.object({
	message: z.string().optional(),
	isPublishLater: z.boolean(),
	scheduledPublishTime: z.coerce.date().optional(),
});

export type PostMessageRequest = z.infer<typeof postMessageRequestSchema>;

export type PostForm = z.infer<typeof postFormSchema>;

const socialMediaTypeEnum = z.enum(["facebook", "instagram"]);

export const postMessageResponseSchema = z.object({
	id: z.number(),
	socialMediaId: z.string().optional().nullable(),
	socialMediaType: socialMediaTypeEnum,
	matchId: z.number(),
	scheduledPublishTime: z.coerce.date().optional().nullable(),
});

export type PostMessageResponse = z.infer<typeof postMessageResponseSchema>;

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

export const getPostByImageIdResponseSchema = z.object({
	posted: z.boolean(),
	post: postMessageResponseSchema.optional(),
});
