import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const testCases = pgTable("test_cases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  url: text("url").notNull(),
  instructions: text("instructions").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const testExecutions = pgTable("test_executions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  testCaseId: varchar("test_case_id").notNull().references(() => testCases.id),
  status: text("status").notNull(),
  executionTime: integer("execution_time").notNull(),
  errorMessage: text("error_message"),
  stackTrace: text("stack_trace"),
  domStabilityScore: real("dom_stability_score"),
  networkCallCount: integer("network_call_count"),
  waitConditionFailures: integer("wait_condition_failures"),
  assertionCount: integer("assertion_count"),
  executedAt: timestamp("executed_at").notNull().defaultNow(),
});

export const flakyTests = pgTable("flaky_tests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  testCaseId: varchar("test_case_id").notNull().references(() => testCases.id),
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

export const insertTestCaseSchema = createInsertSchema(testCases).omit({
  id: true,
  createdAt: true,
});

export const insertTestExecutionSchema = createInsertSchema(testExecutions).omit({
  id: true,
  executedAt: true,
});

export const insertFlakyTestSchema = createInsertSchema(flakyTests).omit({
  id: true,
  detectedAt: true,
});

export type InsertTestCase = z.infer<typeof insertTestCaseSchema>;
export type TestCase = typeof testCases.$inferSelect;

export type InsertTestExecution = z.infer<typeof insertTestExecutionSchema>;
export type TestExecution = typeof testExecutions.$inferSelect;

export type InsertFlakyTest = z.infer<typeof insertFlakyTestSchema>;
export type FlakyTest = typeof flakyTests.$inferSelect;

export type RootCause = {
  type: "timing" | "dom" | "concurrency" | "resource";
  confidence: number;
  description: string;
  location?: string;
};
