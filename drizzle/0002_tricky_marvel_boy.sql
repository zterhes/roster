ALTER TABLE "defaults" ADD COLUMN "post_url" text NOT NULL;--> statement-breakpoint
ALTER TABLE "defaults" DROP COLUMN IF EXISTS "feed_url";