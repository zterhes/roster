import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const playersTable = pgTable("players", {
	id: serial("id").primaryKey(),
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	photoUrl: text("photo_url").notNull(),
});
