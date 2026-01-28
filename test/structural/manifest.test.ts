import { describe, it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { sha256File, type Manifest } from "../../build/src/manifest.js";

const PROJECT_ROOT = join(import.meta.dirname, "../..");
const MANIFEST_PATH = join(PROJECT_ROOT, "manifest.json");
const DOCS_ROOT = join(PROJECT_ROOT, "TypeScript-Website");
const SKILL_DIR = join(PROJECT_ROOT, ".claude/skills/typescript");

describe("manifest integrity", () => {
  let manifest: Manifest;

  it("manifest.json exists and is valid JSON", async () => {
    const content = await readFile(MANIFEST_PATH, "utf-8");
    manifest = JSON.parse(content);
    expect(manifest).toBeDefined();
    expect(manifest.version).toBe("1.0.0");
    expect(manifest.sourceRepo).toBe("microsoft/TypeScript-Website");
    expect(manifest.sourceCommit).toMatch(/^[a-f0-9]{40}$/);
    expect(manifest.buildDate).toBeTruthy();
  });

  it("all source file checksums match current files", async () => {
    const content = await readFile(MANIFEST_PATH, "utf-8");
    manifest = JSON.parse(content);

    const mismatches: string[] = [];
    for (const [relPath, entry] of Object.entries(manifest.sources)) {
      const fullPath = join(DOCS_ROOT, relPath);
      try {
        const currentHash = await sha256File(fullPath);
        if (currentHash !== entry.sha256) {
          mismatches.push(`${relPath}: expected ${entry.sha256.slice(0, 12)}..., got ${currentHash.slice(0, 12)}...`);
        }
      } catch {
        mismatches.push(`${relPath}: file not found`);
      }
    }

    expect(mismatches).toEqual([]);
  });

  it("all output file checksums match current files", async () => {
    const content = await readFile(MANIFEST_PATH, "utf-8");
    manifest = JSON.parse(content);

    const mismatches: string[] = [];
    for (const [relPath, entry] of Object.entries(manifest.outputs)) {
      const fullPath = join(SKILL_DIR, relPath);
      try {
        const currentHash = await sha256File(fullPath);
        if (currentHash !== entry.sha256) {
          mismatches.push(`${relPath}: expected ${entry.sha256.slice(0, 12)}..., got ${currentHash.slice(0, 12)}...`);
        }
      } catch {
        mismatches.push(`${relPath}: file not found`);
      }
    }

    expect(mismatches).toEqual([]);
  });

  it("every source entry has feedsInto pointing to valid outputs", async () => {
    const content = await readFile(MANIFEST_PATH, "utf-8");
    manifest = JSON.parse(content);

    const outputKeys = new Set(Object.keys(manifest.outputs));
    const invalid: string[] = [];

    for (const [relPath, entry] of Object.entries(manifest.sources)) {
      for (const target of entry.feedsInto) {
        // feedsInto references the ref filename; outputs are keyed as refs/<name> or SKILL.md
        const possibleKeys = [target, `refs/${target}`, `SKILL.md`];
        const found = possibleKeys.some((k) => outputKeys.has(k));
        if (!found) {
          invalid.push(`${relPath} feeds into unknown output: ${target}`);
        }
      }
    }

    expect(invalid).toEqual([]);
  });
});
