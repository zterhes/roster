ALTER TABLE "posts" DROP CONSTRAINT "posts_image_id_generated_images_id_fk";
--> statement-breakpoint
ALTER TABLE "generated_images" ADD COLUMN "post_ids" integer[];--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "generated_images" ADD CONSTRAINT "generated_images_post_ids_posts_id_fk" FOREIGN KEY ("post_ids") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN IF EXISTS "image_id";