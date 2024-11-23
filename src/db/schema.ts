import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const playersTable = pgTable("players", {
	id: serial("id").primaryKey(),
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	photoUrl: text("photo_url").notNull(),
	organizationId: text("organization_id").notNull(),
});

export const defaultsTable = pgTable("defaults", {
	id: serial("id").primaryKey(),
	organizationId: text("organization_id").notNull(),
	storyUrl: text("story_url").notNull(),
	feedUrl: text("feed_url").notNull(),
	playerUrl: text("player_url").notNull(),
});
