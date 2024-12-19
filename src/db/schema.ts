import { rosterEnum } from "@/types/Match";
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

export const rosterStatusEnum = pgEnum("roster_status", rosterEnum.options);

export const matchesTable = pgTable("matches", {
	id: serial("id").primaryKey(),
	homeTeam: text("home_team").notNull(),
	homeTeamLogoUrl: text("home_team_logo_url").notNull(),
	awayTeam: text("away_team").notNull(),
	awayTeamLogoUrl: text("away_team_logo_url").notNull(),
	place: text("place").notNull(),
	date: timestamp("date").notNull(),
	rosterStatus: rosterStatusEnum("roster_status").notNull().default("not_created"),
	organizationId: text("organization_id").notNull(),
});

export const rosterTable = pgTable("roster", {
	id: serial("id").primaryKey(),
	matchId: integer("match_id")
		.references(() => matchesTable.id)
		.notNull(),
	playerId: integer("player_id")
		.references(() => playersTable.id)
		.notNull(),
	positionId: integer("position_id").notNull(),
});

export const scoresTable = pgTable("scores", {
	matchId: integer("match_id")
		.references(() => matchesTable.id)
		.notNull()
		.primaryKey(),
	homeTeamScore: integer("home_team_score").notNull(),
	awayTeamScore: integer("away_team_score").notNull(),
});

export const generatedImageStatusEnum = pgEnum("generated_image_status", ["not_generated", "generated", "posted"]);
export const generatedImagesTypesEnum = pgEnum("generated_images_types", [
	"story_roster_image",
	"post_roster_image",
	"story_score_image",
	"post_score_image",
]);
export const generatedImagesTable = pgTable("generated_images", {
	id: serial("id").primaryKey(),
	matchId: integer("match_id")
		.references(() => matchesTable.id)
		.notNull(),
	imageUrl: text("image_url"),
	type: generatedImagesTypesEnum("type").notNull(),
	status: generatedImageStatusEnum("status").notNull().default("not_generated"),
});
