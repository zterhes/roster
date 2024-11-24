import { z } from "zod";
import { fileSchema } from "./File";

export const UpdateDefaultImagesRequest = z.object({
	post: fileSchema.optional().nullable(),
	story: fileSchema.optional().nullable(),
	player: fileSchema.optional().nullable(),
});
