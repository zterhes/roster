CREATE TYPE "public"."social_media_type" AS ENUM('facebook', 'instagram');--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "social_media_id" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "social_media_type" "social_media_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "match_id" integer NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "posts" ADD CONSTRAINT "posts_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
