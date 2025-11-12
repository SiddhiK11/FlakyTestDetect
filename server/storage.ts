import {
  type TestCase,
  type InsertTestCase,
  type TestExecution,
  type FlakyTest,
  type InsertFlakyTest,
  type ExecutionResult,
  testCases,
  executionResults,
  flakyTests,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Test Cases
  getTestCase(id: number): Promise<TestCase | undefined>;
  getAllTestCases(): Promise<TestCase[]>;
  createTestCase(testCase: InsertTestCase): Promise<TestCase>;

  // Test Executions
  getTestExecution(id: number): Promise<TestExecution | undefined>;
  getTestExecutionsByTestCaseId(testCaseId: number): Promise<TestExecution[]>;

  // Flaky Tests
  getFlakyTest(id: number): Promise<FlakyTest | undefined>;
  getFlakyTestByTestCaseId(testCaseId: number): Promise<FlakyTest | undefined>;
  getAllFlakyTests(): Promise<FlakyTest[]>;
  createFlakyTest(flakyTest: InsertFlakyTest): Promise<FlakyTest>;
  updateFlakyTest(id: number, updates: Partial<FlakyTest>): Promise<FlakyTest | undefined>;
}

export class DatabaseStorage implements IStorage {
  private mapExecutionResultToTestExecution(execResult: ExecutionResult, testCaseId: number): TestExecution {
    const resultsData = execResult.results as any;
    
    const executionTime = resultsData?.executionTime ?? 
      resultsData?.duration ?? 
      (execResult.totalActions ? execResult.totalActions * 100 : 1000);
    
    const domStability = resultsData?.domStability ?? 
      resultsData?.domStabilityScore ?? 
      (execResult.success ? 90 : 70);
    
    const networkCalls = resultsData?.networkCalls ?? 
      resultsData?.networkCallCount ?? 
      (execResult.totalActions || 0);
    
    const waitFailures = resultsData?.waitConditionFailures ?? 
      (!execResult.success ? (resultsData?.failedActions || 0) : 0);
    
    return {
      id: execResult.id,
      testCaseId,
      url: execResult.url,
      status: execResult.success ? "passed" : "failed",
      executionTime: typeof executionTime === 'number' ? executionTime : 1000,
      errorMessage: !execResult.success && resultsData?.error ? String(resultsData.error) : null,
      stackTrace: !execResult.success && resultsData?.stackTrace ? String(resultsData.stackTrace) : null,
      domStabilityScore: typeof domStability === 'number' ? domStability : 80,
      networkCallCount: typeof networkCalls === 'number' ? networkCalls : 0,
      waitConditionFailures: typeof waitFailures === 'number' ? waitFailures : 0,
      assertionCount: execResult.successfulActions || 0,
      executedAt: execResult.executedAt || new Date(),
      totalActions: execResult.totalActions,
      successfulActions: execResult.successfulActions,
    };
  }

  async getTestCase(id: number): Promise<TestCase | undefined> {
    const result = await db.select().from(testCases).where(eq(testCases.id, id)).limit(1);
    return result[0];
  }

  async getAllTestCases(): Promise<TestCase[]> {
    return await db.select().from(testCases);
  }

  async createTestCase(testCase: InsertTestCase): Promise<TestCase> {
    const result = await db.insert(testCases).values(testCase).returning();
    return result[0];
  }

  async getTestExecution(id: number): Promise<TestExecution | undefined> {
    const result = await db
      .select({
        execResult: executionResults,
        testCase: testCases,
      })
      .from(executionResults)
      .leftJoin(testCases, eq(executionResults.scrapeResultId, testCases.scrapeResultId))
      .where(eq(executionResults.id, id))
      .limit(1);
    
    if (!result[0] || !result[0].execResult) return undefined;
    
    const testCaseId = result[0].testCase?.id || 0;
    return this.mapExecutionResultToTestExecution(result[0].execResult, testCaseId);
  }

  async getTestExecutionsByTestCaseId(testCaseId: number): Promise<TestExecution[]> {
    const testCase = await this.getTestCase(testCaseId);
    if (!testCase) return [];

    const execResults = await db
      .select()
      .from(executionResults)
      .where(
        and(
          eq(executionResults.websiteId, testCase.websiteId),
          testCase.scrapeResultId ? eq(executionResults.scrapeResultId, testCase.scrapeResultId) : undefined
        )
      )
      .orderBy(desc(executionResults.executedAt))
      .limit(100);

    return execResults.map(er => this.mapExecutionResultToTestExecution(er, testCaseId));
  }

  async getFlakyTest(id: number): Promise<FlakyTest | undefined> {
    const result = await db.select().from(flakyTests).where(eq(flakyTests.id, id)).limit(1);
    return result[0];
  }

  async getFlakyTestByTestCaseId(testCaseId: number): Promise<FlakyTest | undefined> {
    const result = await db.select().from(flakyTests).where(eq(flakyTests.testCaseId, testCaseId)).limit(1);
    return result[0];
  }

  async getAllFlakyTests(): Promise<FlakyTest[]> {
    return await db
      .select()
      .from(flakyTests)
      .where(eq(flakyTests.isResolved, false))
      .orderBy(desc(flakyTests.flakinessScore));
  }

  async createFlakyTest(flakyTest: InsertFlakyTest): Promise<FlakyTest> {
    const result = await db.insert(flakyTests).values(flakyTest).returning();
    return result[0];
  }

  async updateFlakyTest(id: number, updates: Partial<FlakyTest>): Promise<FlakyTest | undefined> {
    const result = await db
      .update(flakyTests)
      .set(updates)
      .where(eq(flakyTests.id, id))
      .returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();
