/**
 * Test runner for SDK-based skill evaluation.
 * Sends skill content + test prompts to the Anthropic API and evaluates responses.
 *
 * Usage: ANTHROPIC_API_KEY=sk-... npx tsx test/eval/runner.ts [--scenario <name>]
 */

import Anthropic from "@anthropic-ai/sdk";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { runEvaluation, type Evaluation, type EvalResult } from "./evaluator.js";

export interface TestScenario {
  name: string;
  mode: "create" | "review" | "setup";
  input: string;
  evaluations: Evaluation[];
}

interface ScenarioResult {
  scenario: string;
  passed: boolean;
  evaluations: EvalResult[];
  output?: string;
  error?: string;
}

const PROJECT_ROOT = join(import.meta.dirname, "../..");
const SKILL_DIR = join(PROJECT_ROOT, ".claude/skills/typescript");

async function loadSkillContent(): Promise<string> {
  const skillMd = await readFile(join(SKILL_DIR, "SKILL.md"), "utf-8");

  // Load all reference files
  const refsDir = join(SKILL_DIR, "refs");
  const refFiles = await readdir(refsDir);
  const refContents: string[] = [];

  for (const filename of refFiles.sort()) {
    const content = await readFile(join(refsDir, filename), "utf-8");
    refContents.push(`\n--- Reference: ${filename} ---\n${content}`);
  }

  return `${skillMd}\n\n${refContents.join("\n")}`;
}

async function loadScenarios(filter?: string): Promise<TestScenario[]> {
  const scenariosDir = join(import.meta.dirname, "scenarios");
  const files = await readdir(scenariosDir);
  const scenarios: TestScenario[] = [];

  for (const file of files.sort()) {
    if (!file.endsWith(".ts")) continue;
    if (filter && !file.includes(filter)) continue;

    const mod = await import(join(scenariosDir, file));
    scenarios.push(mod.scenario);
  }

  return scenarios;
}

async function runScenario(
  client: Anthropic,
  scenario: TestScenario,
  skillContent: string
): Promise<ScenarioResult> {
  const userMessage = `/${scenario.mode} ${scenario.input}`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: skillContent,
      messages: [{ role: "user", content: userMessage }],
    });

    const output = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    const evaluationResults = scenario.evaluations.map((evaluation) =>
      runEvaluation(evaluation, output)
    );

    const allPassed = evaluationResults.every((r) => r.passed);

    return {
      scenario: scenario.name,
      passed: allPassed,
      evaluations: evaluationResults,
      output: output.slice(0, 500), // Truncate for reporting
    };
  } catch (err) {
    return {
      scenario: scenario.name,
      passed: false,
      evaluations: [],
      error: String(err),
    };
  }
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log("ANTHROPIC_API_KEY not set. Skipping eval tests.");
    console.log("Set ANTHROPIC_API_KEY to run evaluation tests against the Anthropic API.");
    process.exit(0);
  }

  const filter = process.argv.includes("--scenario")
    ? process.argv[process.argv.indexOf("--scenario") + 1]
    : undefined;

  console.log("Loading skill content...");
  const skillContent = await loadSkillContent();
  console.log(`Skill content: ${skillContent.split("\n").length} lines\n`);

  console.log("Loading test scenarios...");
  const scenarios = await loadScenarios(filter);
  console.log(`Found ${scenarios.length} scenarios\n`);

  const client = new Anthropic({ apiKey });
  const results: ScenarioResult[] = [];

  for (const scenario of scenarios) {
    process.stdout.write(`Running: ${scenario.name}... `);
    const result = await runScenario(client, scenario, skillContent);
    results.push(result);

    if (result.error) {
      console.log(`ERROR: ${result.error}`);
    } else if (result.passed) {
      console.log("PASSED");
    } else {
      console.log("FAILED");
      for (const evaluation of result.evaluations) {
        if (!evaluation.passed) {
          console.log(`  ✗ ${evaluation.description}: ${evaluation.detail || "failed"}`);
        }
      }
    }
  }

  // Summary
  console.log("\n=== Evaluation Summary ===");
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  console.log(`${passed}/${total} scenarios passed\n`);

  for (const result of results) {
    const icon = result.passed ? "✓" : "✗";
    console.log(`  ${icon} ${result.scenario}`);
    if (!result.passed) {
      for (const evaluation of result.evaluations) {
        const evalIcon = evaluation.passed ? "  ✓" : "  ✗";
        console.log(`    ${evalIcon} ${evaluation.description}`);
      }
    }
  }

  // Exit with failure if not all passed (but allow majority pass)
  const passRate = passed / total;
  if (passRate < 0.7) {
    console.log(`\nFail: pass rate ${(passRate * 100).toFixed(0)}% is below 70% threshold`);
    process.exit(1);
  } else if (passRate < 1) {
    console.log(`\nWarn: pass rate ${(passRate * 100).toFixed(0)}% (some scenarios failed)`);
  }
}

main().catch((err) => {
  console.error("Runner error:", err);
  process.exit(1);
});
