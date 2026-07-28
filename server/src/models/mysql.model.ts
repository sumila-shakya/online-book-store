import { mysqlTable, serial, varchar, timestamp, mysqlEnum, bigint, index } from "drizzle-orm/mysql-core";
import { AUTH_PROVIDER } from "../utils/constants";

/* ------------------------------------------ SCHEMA DEFINITIONS ------------------------------------------ */

// USERS SCHEMA
export const users = mysqlTable('users', {
    userId: serial('user_id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 255 }),
    googleId: varchar('google_id', { length: 255 }).unique(),
    authProvider: mysqlEnum('auth_provider', AUTH_PROVIDER).notNull().default('local'),
    name: varchar('name', { length: 100 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().onUpdateNow()
})

// REFRESH TOKEN SCHEMA
export const refreshTokens = mysqlTable('refresh_tokens', {
    tokenId: serial('token_id').primaryKey(),
    token: varchar('token', { length: 512 }).notNull(),
    userId: bigint('user_id', { mode: 'number', unsigned: true }).notNull().references(() => users.userId, { onDelete: 'cascade', onUpdate: 'cascade' }),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
    expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
}, (table) => {
    return { userIdIdx: index('user_id_idx').on(table.userId) }
})


/* ------------------------------------------ TYPE DEFINITIONS ------------------------------------------ */

// USERS SCHEMA TYPE
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

// REFRESH TOKEN TYPE
export type Token = typeof refreshTokens.$inferSelect
export type NewToken = typeof refreshTokens.$inferInsert