import { integer, pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const playersTable = pgTable("players", {
	id: serial("id").primaryKey(),
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	photoUrl: text("photo_url").notNull(),
	organizationId: text("organization_id").notNull(),
});

export const defaultsTable = pgTable("defaults", {
	organizationId: text("organization_id").notNull().primaryKey(),
	storyUrl: text("story_url"),
	postUrl: text("post_url"),
	playerUrl: text("player_url"),
});

export const matchesTable = pgTable("matches", {
	id: serial("id").primaryKey(),
	homeTeam: text("home_team").notNull(),
	homeTeamLogoUrl: text("home_team_logo_url").notNull(),
	awayTeam: text("away_team").notNull(),
	awayTeamLogoUrl: text("away_team_logo_url").notNull(),
	place: text("place").notNull(),
	date: timestamp("date").notNull(),
	organizationId: text("organization_id").notNull(),
});

export const scoresTable = pgTable("scores", {
	matchId: integer("match_id")
		.references(() => matchesTable.id)
		.notNull()
		.primaryKey(),
	homeTeamScore: integer("home_team_score").notNull(),
	awayTeamScore: integer("away_team_score").notNull(),
});
