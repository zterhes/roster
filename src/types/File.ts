import { z } from "zod";

export const fileSchema = z
	.instanceof(File)
	.refine((file) => file !== null, "File is required")
	.refine((file) => file.size <= 4.5 * 1024 * 1024, "File size must be less than 4.5 MB")
	.refine(
		(file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
		"File type must be image/jpeg, image/png, or image/webp",
	);

export const imageSchema = z
	.object({
		file: fileSchema,
		dimensions: z.object({
			width: z.number(),
			height: z.number(),
		}),
		constraints: z.object({
			minWidth: z.number().min(1, "Width must be greater than 0"),
			minHeight: z.number().min(1, "Height must be greater than 0"),
		}),
	})
	.superRefine((data, ctx) => {
		const { dimensions, constraints } = data;

		if (dimensions.width !== constraints.minWidth) {
			ctx.addIssue({
				path: ["dimensions", "width"],
				code: z.ZodIssueCode.custom,
				message: `Width must be ${constraints.minWidth}`,
			});
		}

		if (dimensions.height !== constraints.minHeight) {
			ctx.addIssue({
				path: ["dimensions", "height"],
				code: z.ZodIssueCode.custom,
				message: `Height must be ${constraints.minHeight}`,
			});
		}
	});
