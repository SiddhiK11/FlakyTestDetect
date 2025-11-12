import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { FlakyTestAnalyzer } from "./flaky-analyzer";
import { insertTestCaseSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const analyzer = new FlakyTestAnalyzer();

  // Get all test cases
  app.get("/api/test-cases", async (_req, res) => {
    try {
      const testCases = await storage.getAllTestCases();
      res.json(testCases);
    } catch (error) {
      console.error("Error fetching test cases:", error);
      res.status(500).json({ error: "Failed to fetch test cases" });
    }
  });

  // Create a new test case
  app.post("/api/test-cases", async (req, res) => {
    try {
      const parsed = insertTestCaseSchema.parse(req.body);
      const testCase = await storage.createTestCase(parsed);
      res.status(201).json(testCase);
    } catch (error) {
      res.status(400).json({ error: "Invalid test case data" });
    }
  });

  // Get test case by ID
  app.get("/api/test-cases/:id", async (req, res) => {
    try {
      const testCaseId = parseInt(req.params.id);
      if (isNaN(testCaseId)) {
        return res.status(400).json({ error: "Invalid test case ID" });
      }
      const testCase = await storage.getTestCase(testCaseId);
      if (!testCase) {
        return res.status(404).json({ error: "Test case not found" });
      }
      res.json(testCase);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch test case" });
    }
  });

  // Analyze test case for flakiness
  app.post("/api/test-cases/:id/analyze", async (req, res) => {
    try {
      const testCaseId = parseInt(req.params.id);
      if (isNaN(testCaseId)) {
        return res.status(400).json({ error: "Invalid test case ID" });
      }

      const allExecutions = await storage.getTestExecutionsByTestCaseId(testCaseId);

      if (allExecutions.length >= 3) {
        const analysis = analyzer.analyze(allExecutions);

        if (analysis.isFlakey) {
          const existingFlakyTest = await storage.getFlakyTestByTestCaseId(testCaseId);

          if (existingFlakyTest) {
            const updated = await storage.updateFlakyTest(existingFlakyTest.id, {
              flakinessScore: analysis.flakinessScore,
              timingVariance: analysis.timingVariance,
              failureRate: analysis.failureRate,
              totalRuns: allExecutions.length,
              failedRuns: allExecutions.filter((e) => e.status === "failed").length,
              rootCauses: analysis.rootCauses as any,
              lastFailedAt: allExecutions.some((e) => e.status === "failed") 
                ? allExecutions.find((e) => e.status === "failed")?.executedAt 
                : existingFlakyTest.lastFailedAt,
            });
            res.json(updated);
          } else {
            const created = await storage.createFlakyTest({
              testCaseId,
              flakinessScore: analysis.flakinessScore,
              timingVariance: analysis.timingVariance,
              failureRate: analysis.failureRate,
              totalRuns: allExecutions.length,
              failedRuns: allExecutions.filter((e) => e.status === "failed").length,
              rootCauses: analysis.rootCauses as any,
              lastFailedAt: allExecutions.find((e) => e.status === "failed")?.executedAt || null,
              isResolved: false,
            });
            res.status(201).json(created);
          }
        } else {
          res.json({ isFlakey: false, message: "Test is not flaky" });
        }
      } else {
        res.json({ isFlakey: false, message: "Not enough executions to analyze" });
      }
    } catch (error) {
      console.error("Error analyzing test case:", error);
      res.status(500).json({ error: "Failed to analyze test case" });
    }
  });

  // Get executions for a test case
  app.get("/api/test-cases/:id/executions", async (req, res) => {
    try {
      const testCaseId = parseInt(req.params.id);
      if (isNaN(testCaseId)) {
        return res.status(400).json({ error: "Invalid test case ID" });
      }
      const executions = await storage.getTestExecutionsByTestCaseId(testCaseId);
      res.json(executions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch executions" });
    }
  });

  // Get all flaky tests
  app.get("/api/flaky-tests", async (_req, res) => {
    try {
      const flakyTests = await storage.getAllFlakyTests();
      res.json(flakyTests);
    } catch (error) {
      console.error("Error fetching flaky tests:", error);
      res.status(500).json({ error: "Failed to fetch flaky tests" });
    }
  });

  // Get flaky test details
  app.get("/api/flaky-tests/:id", async (req, res) => {
    try {
      const flakyTestId = parseInt(req.params.id);
      if (isNaN(flakyTestId)) {
        return res.status(400).json({ error: "Invalid flaky test ID" });
      }
      const flakyTest = await storage.getFlakyTest(flakyTestId);
      if (!flakyTest) {
        return res.status(404).json({ error: "Flaky test not found" });
      }
      res.json(flakyTest);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch flaky test" });
    }
  });

  // Mark flaky test as resolved
  app.patch("/api/flaky-tests/:id/resolve", async (req, res) => {
    try {
      const flakyTestId = parseInt(req.params.id);
      if (isNaN(flakyTestId)) {
        return res.status(400).json({ error: "Invalid flaky test ID" });
      }
      const updated = await storage.updateFlakyTest(flakyTestId, { isResolved: true });
      if (!updated) {
        return res.status(404).json({ error: "Flaky test not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update flaky test" });
    }
  });

  // Get dashboard stats
  app.get("/api/dashboard/stats", async (_req, res) => {
    try {
      const allTestCases = await storage.getAllTestCases();
      const allFlakyTests = await storage.getAllFlakyTests();

      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);

      const totalTests = allTestCases.length;
      const flakyTestCount = allFlakyTests.length;
      const flakyPercentage = totalTests > 0 ? (flakyTestCount / totalTests) * 100 : 0;

      res.json({
        totalTests,
        flakyTestCount,
        flakyPercentage: Math.round(flakyPercentage * 10) / 10,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
