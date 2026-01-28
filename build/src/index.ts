/**
 * CLI orchestrator for the TypeScript skill build pipeline.
 * Usage: npx tsx build/src/index.ts [--build | --check | --diff]
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { execSync } from "node:child_process";
import { generateAllRefs, type GeneratedRef } from "./generate-refs.js";
import { generateSkillMd } from "./generate-skill.js";
import {
  buildManifest,
  detectDrift,
  writeManifest,
  formatDriftReport,
  sha256String,
} from "./manifest.js";
import { DOCS_REPO_DIR, SKILL_OUTPUT_DIR } from "./config.js";

const PROJECT_ROOT = join(dirname(new URL(import.meta.url).pathname), "../..");
const DOCS_ROOT = join(PROJECT_ROOT, DOCS_REPO_DIR);
const SKILL_DIR = join(PROJECT_ROOT, SKILL_OUTPUT_DIR);
const REFS_DIR = join(SKILL_DIR, "refs");
const MANIFEST_PATH = join(PROJECT_ROOT, "manifest.json");
const SOURCE_REPO = "microsoft/TypeScript-Website";

async function getSourceCommit(): Promise<string> {
  try {
    const commit = execSync("git rev-parse HEAD", {
      cwd: DOCS_ROOT,
      encoding: "utf-8",
    }).trim();
    return commit;
  } catch {
    console.warn("Warning: Could not determine docs repo commit hash");
    return "unknown";
  }
}

async function build(): Promise<void> {
  console.log("Building TypeScript skill from docs...");
  console.log(`Docs root: ${DOCS_ROOT}`);

  const sourceCommit = await getSourceCommit();
  console.log(`Source commit: ${sourceCommit}`);

  // Ensure output directories exist
  await mkdir(REFS_DIR, { recursive: true });

  // Generate reference files
  console.log("\nGenerating reference files...");
  const refs = await generateAllRefs(DOCS_ROOT);

  const sourceMappings: Record<string, { sourceFiles: string[] }> = {};

  for (const ref of refs) {
    const outPath = join(REFS_DIR, ref.filename);
    await writeFile(outPath, ref.content, "utf-8");
    const lineCount = ref.content.split("\n").length;
    console.log(
      `  ${ref.filename}: ${lineCount} lines (from ${ref.sourceFiles.length} sources)`
    );
    sourceMappings[ref.filename] = { sourceFiles: ref.sourceFiles };
  }

  // Generate SKILL.md
  console.log("\nGenerating SKILL.md...");
  const skillContent = generateSkillMd({
    sourceCommit,
    sourceRepo: SOURCE_REPO,
    refFiles: refs.map((r) => r.filename),
  });

  const skillPath = join(SKILL_DIR, "SKILL.md");
  await writeFile(skillPath, skillContent, "utf-8");
  const skillLines = skillContent.split("\n").length;
  console.log(`  SKILL.md: ${skillLines} lines`);

  // SKILL.md is template-generated, not from source docs — no source files to track
  sourceMappings["SKILL.md"] = { sourceFiles: [] };

  // Build and write manifest
  console.log("\nBuilding manifest...");
  const manifest = await buildManifest(
    DOCS_ROOT,
    SKILL_DIR,
    sourceCommit,
    SOURCE_REPO,
    sourceMappings
  );
  await writeManifest(manifest, MANIFEST_PATH);

  const sourceCount = Object.keys(manifest.sources).length;
  const outputCount = Object.keys(manifest.outputs).length;
  console.log(
    `  Manifest: ${sourceCount} source files, ${outputCount} output files`
  );

  console.log("\nBuild complete!");
}

async function check(): Promise<void> {
  console.log("Checking for drift against stored manifest...");

  try {
    const report = await detectDrift(MANIFEST_PATH, DOCS_ROOT);
    console.log(formatDriftReport(report));

    if (report.hasDrift) {
      process.exit(1);
    }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      console.error(
        "Error: manifest.json not found. Run --build first."
      );
      process.exit(1);
    }
    throw err;
  }
}

async function diff(): Promise<void> {
  console.log("Computing diff (dry run)...\n");

  const sourceCommit = await getSourceCommit();
  const refs = await generateAllRefs(DOCS_ROOT);

  for (const ref of refs) {
    const outPath = join(REFS_DIR, ref.filename);
    let existing: string;
    try {
      existing = await readFile(outPath, "utf-8");
    } catch {
      console.log(`  NEW: ${ref.filename} (${ref.content.split("\n").length} lines)`);
      continue;
    }

    const existingHash = sha256String(existing);
    const newHash = sha256String(ref.content);

    if (existingHash === newHash) {
      console.log(`  UNCHANGED: ${ref.filename}`);
    } else {
      const existingLines = existing.split("\n").length;
      const newLines = ref.content.split("\n").length;
      console.log(
        `  CHANGED: ${ref.filename} (${existingLines} → ${newLines} lines)`
      );
    }
  }

  // Check SKILL.md
  const skillContent = generateSkillMd({
    sourceCommit,
    sourceRepo: SOURCE_REPO,
    refFiles: refs.map((r) => r.filename),
  });
  const skillPath = join(SKILL_DIR, "SKILL.md");
  try {
    const existing = await readFile(skillPath, "utf-8");
    const existingHash = sha256String(existing);
    const newHash = sha256String(skillContent);
    if (existingHash === newHash) {
      console.log(`  UNCHANGED: SKILL.md`);
    } else {
      console.log(`  CHANGED: SKILL.md`);
    }
  } catch {
    console.log(`  NEW: SKILL.md`);
  }
}

// --- CLI entry point ---

const command = process.argv[2];

switch (command) {
  case "--build":
    await build();
    break;
  case "--check":
    await check();
    break;
  case "--diff":
    await diff();
    break;
  default:
    console.log("Usage: npx tsx build/src/index.ts [--build | --check | --diff]");
    console.log("");
    console.log("Commands:");
    console.log("  --build  Generate skill files from docs and write manifest");
    console.log("  --check  Detect drift between docs and stored manifest");
    console.log("  --diff   Show what would change without writing");
    process.exit(command ? 1 : 0);
}
