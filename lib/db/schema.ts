import { relations } from "drizzle-orm";
import {
  integer,
  json,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const patientTable = pgTable("patients", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  age: integer("age"),
  gender: varchar("gender", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 255 }),
  email: varchar("email", { length: 255 }),
  medicalHistory: json("medicalHistory").default({}),
  doctorId: varchar("doctorId", { length: 255 }).notNull(),
  lastVisit: timestamp("lastVisit").defaultNow().notNull(),
  condition: varchar("condition", { length: 255 }),
  status: varchar("status", { length: 255 }),
});

export const visitsTable = pgTable("visits", {
  id: uuid("id").primaryKey().defaultRandom(),
  diagnosis: json("diagnosis").default([]),
  prescriptions: json("prescriptions").default([]),
  symptoms: text("symptoms").default(""),
  patientId: uuid("patientId").references(() => patientTable.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const patientTableRelations = relations(patientTable, ({ many }) => ({
  visits: many(visitsTable),
}));

export const visitsRelation = relations(visitsTable, ({ one }) => ({
  patients: one(patientTable, {
    fields: [visitsTable.patientId],
    references: [patientTable.id],
  }),
}));
