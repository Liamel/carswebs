import { relations, sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["ADMIN"]);
export const bookingStatusEnum = pgEnum("booking_status", ["PENDING", "CONFIRMED", "CANCELLED"]);

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }),
    role: roleEnum("role").notNull().default("ADMIN"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email),
  }),
);

export const cars = pgTable(
  "cars",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 140 }).notNull(),
    priceFrom: integer("price_from").notNull(),
    bodyType: varchar("body_type", { length: 80 }).notNull(),
    description: text("description").notNull(),
    featured: boolean("featured").notNull().default(false),
    specs: jsonb("specs").$type<Record<string, string>>().notNull().default(sql`'{}'::jsonb`),
    images: jsonb("images").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex("cars_slug_idx").on(table.slug),
  }),
);

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  carId: integer("car_id").references(() => cars.id, { onDelete: "set null" }),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  preferredDateTime: timestamp("preferred_date_time", { withTimezone: true }).notNull(),
  location: varchar("location", { length: 150 }).notNull(),
  note: text("note"),
  status: bookingStatusEnum("status").notNull().default("PENDING"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const content = pgTable(
  "content",
  {
    id: serial("id").primaryKey(),
    key: varchar("key", { length: 120 }).notNull(),
    value: jsonb("value").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    keyIdx: uniqueIndex("content_key_idx").on(table.key),
  }),
);

export const carsRelations = relations(cars, ({ many }) => ({
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  car: one(cars, {
    fields: [bookings.carId],
    references: [cars.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type Car = typeof cars.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type ContentEntry = typeof content.$inferSelect;
export type BookingStatus = (typeof bookingStatusEnum.enumValues)[number];
