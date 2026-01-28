import { describe, it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import matter from "gray-matter";

const SKILL_DIR = join(import.meta.dirname, "../../.claude/skills/typescript");
const SKILL_PATH = join(SKILL_DIR, "SKILL.md");

describe("SKILL.md format", () => {
  let content: string;
  let frontmatter: Record<string, unknown>;

  it("SKILL.md exists and is readable", async () => {
    content = await readFile(SKILL_PATH, "utf-8");
    expect(content).toBeTruthy();
  });

  it("has valid YAML frontmatter", async () => {
    content = await readFile(SKILL_PATH, "utf-8");
    const parsed = matter(content);
    frontmatter = parsed.data;
    expect(frontmatter).toBeDefined();
  });

  it("has required frontmatter fields", async () => {
    content = await readFile(SKILL_PATH, "utf-8");
    const parsed = matter(content);
    frontmatter = parsed.data;

    expect(frontmatter.name).toBe("typescript");
    expect(typeof frontmatter.description).toBe("string");
    expect((frontmatter.description as string).length).toBeGreaterThan(10);
    expect((frontmatter.description as string).length).toBeLessThanOrEqual(1024);
  });

  it("is under 500 lines", async () => {
    content = await readFile(SKILL_PATH, "utf-8");
    const lineCount = content.split("\n").length;
    expect(lineCount).toBeLessThanOrEqual(500);
  });

  it("contains all three mode sections", async () => {
    content = await readFile(SKILL_PATH, "utf-8");
    expect(content).toContain("## CREATE Mode");
    expect(content).toContain("## REVIEW Mode");
    expect(content).toContain("## SETUP Mode");
  });

  it("contains core principles", async () => {
    content = await readFile(SKILL_PATH, "utf-8");
    expect(content).toContain("strict");
    expect(content).toContain("unknown");
    expect(content).toContain("narrowing");
  });

  it("references the source commit", async () => {
    content = await readFile(SKILL_PATH, "utf-8");
    expect(content).toMatch(/commit\s+`[a-f0-9]+`/);
  });

  it("name field matches skill naming conventions", async () => {
    content = await readFile(SKILL_PATH, "utf-8");
    const parsed = matter(content);
    const name = parsed.data.name as string;
    expect(name).toMatch(/^[a-z0-9-]+$/);
    expect(name.length).toBeLessThanOrEqual(64);
  });
});
