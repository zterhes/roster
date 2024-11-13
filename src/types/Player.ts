import { z } from "zod";

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

const fileSchema = z
	.instanceof(File)
	.refine((file) => file !== null, "File is required")
	.refine(
		(file) => file.size <= 4.5 * 1024 * 1024,
		"File size must be less than 4.5 MB",
	)
	.refine(
		(file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
		"File type must be image/jpeg, image/png, or image/webp",
	);

export const createPlayerRequestSchema = z.object({
	firstName: z.string(),
	lastName: z.string(),
	file: fileSchema.nullable(),
});

export const updatePlayerRequestSchema = z.object({
	id: z.number(),
	firstName: z.string(),
	lastName: z.string(),
	file: fileSchema.nullable(),
});
