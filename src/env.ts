import { z } from "zod";

const envSchema = z.object({
	NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
	CLERK_SECRET_KEY: z.string(),
	POSTGRES_URL: z.string(),
	BLOB_READ_WRITE_TOKEN: z.string(),
	DEFAULT_IMAGE_URL: z.string(),
});

const ParsedEnv = envSchema.safeParse(process.env);

if (!ParsedEnv.success) {
    throw new Error("Invalid environment variables");
}

const env = ParsedEnv.data;

export default env;