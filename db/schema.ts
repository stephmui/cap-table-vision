import { pgTable, text, integer, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const shareholders = pgTable("shareholders", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  sharesOwned: decimal("shares_owned", { precision: 15, scale: 2 }).notNull(),
  shareClass: text("share_class").default("common"),
  dateAdded: timestamp("date_added").defaultNow()
});

export const optionPool = pgTable("option_pool", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  size: decimal("size", { precision: 15, scale: 2 }).notNull().default("0"),
  lastUpdated: timestamp("last_updated").defaultNow()
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

export const investmentRounds = pgTable("investment_rounds", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  type: text("type").notNull(), // SAFE, EQUITY, or CONVERTIBLE
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  valuation_cap: decimal("valuation_cap", { precision: 15, scale: 2 }).notNull(),
  discount_rate: decimal("discount_rate", { precision: 5, scale: 2 }),
  round_number: integer("round_number").notNull(),
  date_added: timestamp("date_added").defaultNow()
});

export const insertInvestmentRoundSchema = createInsertSchema(investmentRounds);
export const selectInvestmentRoundSchema = createSelectSchema(investmentRounds);
export type InsertInvestmentRound = z.infer<typeof insertInvestmentRoundSchema>;
export type InvestmentRound = z.infer<typeof selectInvestmentRoundSchema>;
