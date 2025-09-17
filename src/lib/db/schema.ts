import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    email: text("email").unique().notNull(),
    name: text("name").notNull(),
    passwordHash: text("password_hash"),
    handle: text("handle").unique().notNull(),
    createdAt: int("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
});