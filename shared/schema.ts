import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, jsonb, boolean, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const websites = pgTable("websites", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  url: varchar("url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const scrapeResults = pgTable("scrape_results", {
  id: serial("id").primaryKey(),
  websiteId: integer("website_id").notNull().references(() => websites.id),
  url: varchar("url", { length: 500 }).notNull(),
  prompt: text("prompt").notNull(),
  analysisData: jsonb("analysis_data"),
  interactiveElementsCount: integer("interactive_elements_count"),
  scrapedAt: timestamp("scraped_at").defaultNow(),
});

export const testCases = pgTable("test_cases", {
  id: serial("id").primaryKey(),
  scrapeResultId: integer("scrape_result_id").notNull().references(() => scrapeResults.id),
  websiteId: integer("website_id").notNull().references(() => websites.id),
  testCaseId: varchar("test_case_id", { length: 100 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  priority: varchar("priority", { length: 20 }).notNull(),
  steps: jsonb("steps").notNull(),
  expectedBehavior: text("expected_behavior").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const executionResults = pgTable("execution_results", {
  id: serial("id").primaryKey(),
  websiteId: integer("website_id").notNull().references(() => websites.id),
  scrapeResultId: integer("scrape_result_id").references(() => scrapeResults.id),
  url: varchar("url", { length: 500 }).notNull(),
  prompt: text("prompt").notNull(),
  success: boolean("success").notNull(),
  totalActions: integer("total_actions"),
  successfulActions: integer("successful_actions"),
  results: jsonb("results"),
  screenshot: text("screenshot"),
  executedAt: timestamp("executed_at").defaultNow(),
});

export const flakyTests = pgTable("flaky_tests", {
  id: serial("id").primaryKey(),
  testCaseId: integer("test_case_id").notNull().references(() => testCases.id),
  flakinessScore: real("flakiness_score").notNull(),
  timingVariance: real("timing_variance").notNull(),
  failureRate: real("failure_rate").notNull(),
  totalRuns: integer("total_runs").notNull(),
  failedRuns: integer("failed_runs").notNull(),
  rootCauses: jsonb("root_causes").notNull(),
  lastFailedAt: timestamp("last_failed_at"),
  isResolved: boolean("is_resolved").notNull().default(false),
  detectedAt: timestamp("detected_at").notNull().defaultNow(),
});

export const insertWebsiteSchema = createInsertSchema(websites).omit({
  id: true,
  createdAt: true,
});

export const insertScrapeResultSchema = createInsertSchema(scrapeResults).omit({
  id: true,
  scrapedAt: true,
});

export const insertTestCaseSchema = createInsertSchema(testCases).omit({
  id: true,
  createdAt: true,
});

export const insertExecutionResultSchema = createInsertSchema(executionResults).omit({
  id: true,
  executedAt: true,
});

export const insertFlakyTestSchema = createInsertSchema(flakyTests).omit({
  id: true,
  detectedAt: true,
});

export type InsertWebsite = z.infer<typeof insertWebsiteSchema>;
export type Website = typeof websites.$inferSelect;

export type InsertScrapeResult = z.infer<typeof insertScrapeResultSchema>;
export type ScrapeResult = typeof scrapeResults.$inferSelect;

export type InsertTestCase = z.infer<typeof insertTestCaseSchema>;
export type TestCase = typeof testCases.$inferSelect;

export type InsertExecutionResult = z.infer<typeof insertExecutionResultSchema>;
export type ExecutionResult = typeof executionResults.$inferSelect;

export type InsertFlakyTest = z.infer<typeof insertFlakyTestSchema>;
export type FlakyTest = typeof flakyTests.$inferSelect;

export type RootCause = {
  type: "timing" | "dom" | "concurrency" | "resource";
  confidence: number;
  description: string;
  location?: string;
};

export interface TestExecution {
  id: number;
  testCaseId: number;
  url: string;
  status: "passed" | "failed";
  executionTime: number;
  errorMessage?: string | null;
  stackTrace?: string | null;
  domStabilityScore?: number | null;
  networkCallCount?: number | null;
  waitConditionFailures?: number | null;
  assertionCount?: number | null;
  executedAt: Date;
  totalActions?: number | null;
  successfulActions?: number | null;
}
