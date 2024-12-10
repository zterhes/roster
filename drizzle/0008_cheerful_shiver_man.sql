CREATE TABLE IF NOT EXISTS "scores" (
	"match_id" integer PRIMARY KEY NOT NULL,
	"home_team_score" integer NOT NULL,
	"away_team_score" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "roster" RENAME COLUMN "position" TO "position_id";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "scores" ADD CONSTRAINT "scores_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
