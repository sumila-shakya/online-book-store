import { mysqlTable, serial, varchar, timestamp, mysqlEnum } from "drizzle-orm/mysql-core";
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


/* ------------------------------------------ TYPE DEFINITIONS ------------------------------------------ */

// USERS SCHEMA TYPE
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert