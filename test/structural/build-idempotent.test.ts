import { describe, it, expect } from "vitest";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { sha256String } from "../../build/src/manifest.js";
import { generateAllRefs } from "../../build/src/generate-refs.js";
import { generateSkillMd } from "../../build/src/generate-skill.js";
import { DOCS_REPO_DIR } from "../../build/src/config.js";

const PROJECT_ROOT = join(import.meta.dirname, "../..");
const DOCS_ROOT = join(PROJECT_ROOT, DOCS_REPO_DIR);
const SKILL_DIR = join(PROJECT_ROOT, ".claude/skills/typescript");

describe("build idempotency", () => {
  it("regenerating refs produces identical output", async () => {
    const refs = await generateAllRefs(DOCS_ROOT);
    const mismatches: string[] = [];

    for (const ref of refs) {
      const existingPath = join(SKILL_DIR, "refs", ref.filename);
      let existing: string;
      try {
        existing = await readFile(existingPath, "utf-8");
      } catch {
        mismatches.push(`${ref.filename}: file does not exist on disk`);
        continue;
      }

      const existingHash = sha256String(existing);
      const newHash = sha256String(ref.content);

      if (existingHash !== newHash) {
        mismatches.push(
          `${ref.filename}: content differs (disk: ${existingHash.slice(0, 12)}, generated: ${newHash.slice(0, 12)})`
        );
      }
    }

    expect(mismatches).toEqual([]);
  });

  it("regenerating SKILL.md produces identical output", async () => {
    const refs = await generateAllRefs(DOCS_ROOT);
    const existingSkill = await readFile(join(SKILL_DIR, "SKILL.md"), "utf-8");

    // Extract commit from existing SKILL.md to use for regeneration
    const commitMatch = existingSkill.match(/commit\s+`([a-f0-9]+)`/);
    const commit = commitMatch
      ? commitMatch[1]
      : "unknown";

    // The commit in SKILL.md is truncated to 12 chars, but the generator uses
    // the full commit. We need the full commit for comparison.
    // Read it from manifest instead.
    const manifestContent = await readFile(
      join(PROJECT_ROOT, "manifest.json"),
      "utf-8"
    );
    const manifest = JSON.parse(manifestContent);
    const fullCommit = manifest.sourceCommit;

    const newSkill = generateSkillMd({
      sourceCommit: fullCommit,
      sourceRepo: "microsoft/TypeScript-Website",
      refFiles: refs.map((r) => r.filename),
    });

    const existingHash = sha256String(existingSkill);
    const newHash = sha256String(newSkill);

    expect(newHash).toBe(existingHash);
  });
});
