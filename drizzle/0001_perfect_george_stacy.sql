CREATE TABLE IF NOT EXISTS "defaults" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"story_url" text NOT NULL,
	"feed_url" text NOT NULL,
	"player_url" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "organization_id" text NOT NULL;