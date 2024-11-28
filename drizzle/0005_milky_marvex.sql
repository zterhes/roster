CREATE TABLE IF NOT EXISTS "matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"home_team" text NOT NULL,
	"home_team_logo_url" text NOT NULL,
	"away_team" text NOT NULL,
	"away_team_logo_url" text NOT NULL,
	"place" text NOT NULL,
	"date" timestamp NOT NULL,
	"organization_id" text NOT NULL
);
