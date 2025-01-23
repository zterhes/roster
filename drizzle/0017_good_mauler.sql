ALTER TABLE "generated_images_posts" ADD COLUMN "match_id" integer NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "generated_images_posts" ADD CONSTRAINT "generated_images_posts_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
