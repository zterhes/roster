import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
	NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
	CLERK_SECRET_KEY: z.string(),
	POSTGRES_URL: z.string(),
	BLOB_READ_WRITE_TOKEN: z.string(),
});

const env = envSchema.parse(process.env);

export default env;
