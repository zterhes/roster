import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const config = {
	facebook: {
		baseUrl: "https://graph.facebook.com",
		api_version: "v21.0",
		accountUrl: "/me/accounts",
		postUrl: "/photos",
		storyUrl: "/photo_stories",
	},
};

const envSchema = z.object({
	NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
	CLERK_SECRET_KEY: z.string(),
	POSTGRES_URL: z.string(),
	BLOB_READ_WRITE_TOKEN: z.string(),
	FACEBOOK_BASE_URL: z.string(),
	FACEBOOK_API_VERSION: z.string(),
	FACEBOOK_ACCOUNT_URL: z.string(),
	FACEBOOK_PAGE_ID: z.string(),
	FACEBOOK_POST_URL: z.string(),
	FACEBOOK_STORY_URL: z.string(),
	FACEBOOK_USER_TOKEN: z.string(),
});

const env = envSchema.parse({
	...process.env,
	FACEBOOK_BASE_URL: config.facebook.baseUrl,
	FACEBOOK_API_VERSION: config.facebook.api_version,
	FACEBOOK_ACCOUNT_URL: config.facebook.accountUrl,
	FACEBOOK_POST_URL: config.facebook.postUrl,
	FACEBOOK_STORY_URL: config.facebook.storyUrl,
});

export default env;
