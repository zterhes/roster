CREATE TABLE IF NOT EXISTS "generated_images_posts" (
	"generated_image_id" integer NOT NULL,
	"post_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "generated_images" DROP CONSTRAINT "generated_images_post_ids_posts_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "generated_images_posts" ADD CONSTRAINT "generated_images_posts_generated_image_id_generated_images_id_fk" FOREIGN KEY ("generated_image_id") REFERENCES "public"."generated_images"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "generated_images_posts" ADD CONSTRAINT "generated_images_posts_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "generated_images" DROP COLUMN IF EXISTS "post_ids";