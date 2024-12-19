CREATE TYPE "public"."generated_image_status" AS ENUM('not_generated', 'generated', 'posted');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "generated_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"match_id" integer NOT NULL,
	"image_url" text,
	"status" "generated_image_status" DEFAULT 'not_generated' NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "generated_images" ADD CONSTRAINT "generated_images_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
