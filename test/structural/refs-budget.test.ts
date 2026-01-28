import { describe, it, expect } from "vitest";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { REF_FILE_SOURCES } from "../../build/src/config.js";

const REFS_DIR = join(import.meta.dirname, "../../.claude/skills/typescript/refs");

describe("reference file budgets", () => {
  it("all configured ref files exist", async () => {
    const expected = Object.keys(REF_FILE_SOURCES);
    const actual = await readdir(REFS_DIR);

    for (const filename of expected) {
      expect(actual).toContain(filename);
    }
  });

  it("each ref file is within its line budget", async () => {
    const overBudget: string[] = [];

    for (const [filename, mapping] of Object.entries(REF_FILE_SOURCES)) {
      const content = await readFile(join(REFS_DIR, filename), "utf-8");
      const lineCount = content.split("\n").length;

      // Allow 5% overage for truncation marker
      const maxAllowed = Math.ceil(mapping.maxLines * 1.05);
      if (lineCount > maxAllowed) {
        overBudget.push(
          `${filename}: ${lineCount} lines (budget: ${mapping.maxLines})`
        );
      }
    }

    expect(overBudget).toEqual([]);
  });

  it("no ref file is empty", async () => {
    const empty: string[] = [];

    for (const filename of Object.keys(REF_FILE_SOURCES)) {
      const content = await readFile(join(REFS_DIR, filename), "utf-8");
      if (content.trim().length < 50) {
        empty.push(filename);
      }
    }

    expect(empty).toEqual([]);
  });

  it("ref files contain valid markdown", async () => {
    const invalid: string[] = [];

    for (const filename of Object.keys(REF_FILE_SOURCES)) {
      const content = await readFile(join(REFS_DIR, filename), "utf-8");

      // Basic markdown validation: should have at least one heading
      if (!content.match(/^#{1,6}\s/m)) {
        invalid.push(`${filename}: no headings found`);
      }

      // Check for unclosed code blocks
      const openFences = (content.match(/^```/gm) || []).length;
      if (openFences % 2 !== 0) {
        invalid.push(`${filename}: unclosed code block`);
      }
    }

    expect(invalid).toEqual([]);
  });
});
