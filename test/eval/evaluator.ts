/**
 * Evaluation functions for TypeScript skill output.
 */

import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomBytes } from "node:crypto";

export interface Evaluation {
  type: "contains" | "compiles" | "no-any" | "tsconfig-valid" | "regex" | "not-contains";
  value: string;
  description: string;
}

export interface EvalResult {
  passed: boolean;
  description: string;
  detail?: string;
}

/**
 * Run a single evaluation against LLM output.
 */
export function runEvaluation(evaluation: Evaluation, output: string): EvalResult {
  switch (evaluation.type) {
    case "contains":
      return evalContains(evaluation, output);
    case "not-contains":
      return evalNotContains(evaluation, output);
    case "compiles":
      return evalCompiles(evaluation, output);
    case "no-any":
      return evalNoAny(evaluation, output);
    case "tsconfig-valid":
      return evalTsconfigValid(evaluation, output);
    case "regex":
      return evalRegex(evaluation, output);
  }
}

function evalContains(evaluation: Evaluation, output: string): EvalResult {
  const found = output.toLowerCase().includes(evaluation.value.toLowerCase());
  return {
    passed: found,
    description: evaluation.description,
    detail: found ? undefined : `"${evaluation.value}" not found in output`,
  };
}

function evalNotContains(evaluation: Evaluation, output: string): EvalResult {
  const found = output.toLowerCase().includes(evaluation.value.toLowerCase());
  return {
    passed: !found,
    description: evaluation.description,
    detail: found ? `"${evaluation.value}" was found in output (should not be)` : undefined,
  };
}

function evalCompiles(evaluation: Evaluation, output: string): EvalResult {
  const codeBlocks = extractTypeScriptBlocks(output);
  if (codeBlocks.length === 0) {
    return {
      passed: false,
      description: evaluation.description,
      detail: "No TypeScript code blocks found in output",
    };
  }

  const code = codeBlocks.join("\n\n");
  const tmpDir = join(tmpdir(), `ts-eval-${randomBytes(4).toString("hex")}`);

  try {
    mkdirSync(tmpDir, { recursive: true });

    // Write a minimal tsconfig
    writeFileSync(
      join(tmpDir, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: {
          target: "ES2022",
          module: "nodenext",
          moduleResolution: "nodenext",
          strict: evaluation.value === "strict",
          noEmit: true,
          skipLibCheck: true,
          lib: ["ES2022"],
        },
      })
    );

    writeFileSync(join(tmpDir, "test.ts"), code);

    execSync("npx tsc --noEmit", { cwd: tmpDir, timeout: 30000, stdio: "pipe" });
    return { passed: true, description: evaluation.description };
  } catch (err) {
    const stderr = (err as { stderr?: Buffer }).stderr?.toString() || "Unknown error";
    return {
      passed: false,
      description: evaluation.description,
      detail: `Compilation failed: ${stderr.slice(0, 200)}`,
    };
  } finally {
    try {
      rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  }
}

function evalNoAny(_evaluation: Evaluation, output: string): EvalResult {
  const codeBlocks = extractTypeScriptBlocks(output);
  const code = codeBlocks.join("\n");

  // Match `: any` but not in comments or strings, and not `unknown`
  const anyMatches = code.match(/:\s*any\b/g) || [];
  // Also catch `as any`
  const asAnyMatches = code.match(/as\s+any\b/g) || [];
  const total = anyMatches.length + asAnyMatches.length;

  return {
    passed: total === 0,
    description: _evaluation.description,
    detail: total > 0 ? `Found ${total} uses of 'any' in code` : undefined,
  };
}

function evalTsconfigValid(_evaluation: Evaluation, output: string): EvalResult {
  const jsonBlocks = extractJsonBlocks(output);
  if (jsonBlocks.length === 0) {
    return {
      passed: false,
      description: _evaluation.description,
      detail: "No JSON blocks found in output",
    };
  }

  for (const block of jsonBlocks) {
    try {
      const parsed = JSON.parse(block);
      if (parsed.compilerOptions) {
        return { passed: true, description: _evaluation.description };
      }
    } catch {
      // Try next block
    }
  }

  return {
    passed: false,
    description: _evaluation.description,
    detail: "No valid tsconfig.json found in JSON blocks",
  };
}

function evalRegex(evaluation: Evaluation, output: string): EvalResult {
  const regex = new RegExp(evaluation.value, "i");
  const found = regex.test(output);
  return {
    passed: found,
    description: evaluation.description,
    detail: found ? undefined : `Pattern /${evaluation.value}/i not found`,
  };
}

/**
 * Extract TypeScript code blocks from markdown output.
 */
export function extractTypeScriptBlocks(output: string): string[] {
  const blocks: string[] = [];
  const regex = /```(?:ts|typescript|tsx)\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(output)) !== null) {
    blocks.push(match[1].trim());
  }

  return blocks;
}

/**
 * Extract JSON code blocks from markdown output.
 */
function extractJsonBlocks(output: string): string[] {
  const blocks: string[] = [];
  const regex = /```(?:json|jsonc)\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(output)) !== null) {
    blocks.push(match[1].trim());
  }

  return blocks;
}
