import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FlakyTestTable } from "@/components/flaky-test-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function FlakyTests() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("flakiness");

  const { data: flakyTests = [], isLoading } = useQuery({
    queryKey: ["/api/flaky-tests"],
  });

  const { data: allTestCases = [] } = useQuery({
    queryKey: ["/api/test-cases"],
  });

  const formattedTests = flakyTests.map((test: any) => ({
    id: String(test.id),
    name: allTestCases.find((tc: any) => tc.id === test.testCaseId)?.title || `Test Case #${test.testCaseId}`,
    flakinessScore: Math.round(test.flakinessScore),
    failureRate: Math.round(test.failureRate),
    lastFailed: test.lastFailedAt 
      ? formatDistanceToNow(new Date(test.lastFailedAt), { addSuffix: true })
      : "Never",
    rootCause: test.rootCauses?.[0]?.description || "Unknown",
    totalRuns: test.totalRuns,
    failedRuns: test.failedRuns,
  }));

  const filteredTests = formattedTests
    .filter((test) =>
      test.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "flakiness") return b.flakinessScore - a.flakinessScore;
      if (sortBy === "failures") return b.failedRuns - a.failedRuns;
      if (sortBy === "recent") return 0;
      return 0;
    });

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" data-testid="heading-flaky-tests">
          Flaky Tests
        </h1>
        <p className="text-muted-foreground mt-1">
          All detected flaky tests with detailed analysis
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-tests"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48" data-testid="select-sort">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="flakiness">Flakiness Score</SelectItem>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="failures">Most Failures</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" data-testid="button-filter">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading flaky tests...</div>
      ) : filteredTests.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchQuery ? "No tests match your search" : "No flaky tests detected"}
        </div>
      ) : (
        <FlakyTestTable tests={filteredTests} title="All Flaky Tests" />
      )}
    </div>
  );
}
