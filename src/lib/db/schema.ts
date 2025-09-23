import { int, sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    email: text("email").unique().notNull(),
    name: text("name").notNull(),
    passwordHash: text("password_hash"),
    handle: text("handle").unique(), // Removed .notNull() to allow null handles for OAuth users
    createdAt: int("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
    emailVerified: integer({ mode: 'boolean' }).$default(() => false), // 0 = false, 1 = true
});

export const linksTable = sqliteTable("links", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
        .notNull()
        .references(() => usersTable.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // e.g., 'instagram', 'twitter', 'linkedin', 'website', etc.
    url: text("url").notNull(),
    createdAt: int("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
});