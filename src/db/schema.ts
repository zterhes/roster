import { pgTable, serial, text } from "drizzle-orm/pg-core";

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
