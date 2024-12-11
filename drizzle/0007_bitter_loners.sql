CREATE TYPE "public"."roster_status" AS ENUM('not_created', 'saved', 'generated', 'posted');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "roster" (
	"id" serial PRIMARY KEY NOT NULL,
	"match_id" integer NOT NULL,
	"player_id" integer NOT NULL,
	"position" text NOT NULL
);
--> statement-breakpoint
DROP TABLE "scores" CASCADE;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "roster_status" "roster_status" DEFAULT 'not_created' NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "roster" ADD CONSTRAINT "roster_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "roster" ADD CONSTRAINT "roster_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
