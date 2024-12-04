import { pgTable, text, integer, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const shareholders = pgTable("shareholders", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  sharesOwned: decimal("shares_owned", { precision: 15, scale: 2 }).notNull(),
  optionsGranted: decimal("options_granted", { precision: 15, scale: 2 }).default("0"),
  shareClass: text("share_class").default("common"),
  dateAdded: timestamp("date_added").defaultNow()
});

export const investments = pgTable("investments", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  type: text("type").notNull(), // SAFE, Equity, etc.
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  preMoney: decimal("pre_money", { precision: 15, scale: 2 }).notNull(),
  newShares: decimal("new_shares", { precision: 15, scale: 2 }).notNull(),
  date: timestamp("date").defaultNow()
});

export const insertShareholderSchema = createInsertSchema(shareholders);
export const selectShareholderSchema = createSelectSchema(shareholders);
export const insertInvestmentSchema = createInsertSchema(investments);
export const selectInvestmentSchema = createSelectSchema(investments);

export type InsertShareholder = z.infer<typeof insertShareholderSchema>;
export type Shareholder = z.infer<typeof selectShareholderSchema>;
export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;
export type Investment = z.infer<typeof selectInvestmentSchema>;
