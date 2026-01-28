/**
 * Manifest management: SHA-256 checksums, versioning, and drift detection.
 */

import { createHash } from "node:crypto";
import { readFile, writeFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { glob } from "glob";

export interface Manifest {
  version: string;
  sourceRepo: string;
  sourceCommit: string;
  buildDate: string;
  sources: Record<string, SourceEntry>;
  outputs: Record<string, OutputEntry>;
}

export interface SourceEntry {
  sha256: string;
  feedsInto: string[];
}

export interface OutputEntry {
  sha256: string;
  lines: number;
  generatedFrom: string[];
}

export interface DriftReport {
  changed: string[];
  added: string[];
  removed: string[];
  affectedOutputs: string[];
  hasDrift: boolean;
}

/**
 * Compute SHA-256 hash of a file.
 */
export async function sha256File(filePath: string): Promise<string> {
  const content = await readFile(filePath);
  return createHash("sha256").update(content).digest("hex");
}

/**
 * Compute SHA-256 hash of a string.
 */
export function sha256String(content: string): string {
  return createHash("sha256").update(content, "utf-8").digest("hex");
}

/**
 * Build a fresh manifest from source docs and generated output files.
 */
export async function buildManifest(
  docsRoot: string,
  outputDir: string,
  sourceCommit: string,
  sourceRepo: string,
  sourceMappings: Record<string, { sourceFiles: string[] }>
): Promise<Manifest> {
  const sources: Record<string, SourceEntry> = {};
  const outputs: Record<string, OutputEntry> = {};

  // Collect all source files from the mappings
  const allSourceFiles = new Set<string>();
  const fileToOutputs = new Map<string, string[]>();

  for (const [outputFile, mapping] of Object.entries(sourceMappings)) {
    for (const sourceFile of mapping.sourceFiles) {
      allSourceFiles.add(sourceFile);
      const existing = fileToOutputs.get(sourceFile) || [];
      existing.push(outputFile);
      fileToOutputs.set(sourceFile, existing);
    }
  }

  // Hash all source files
  for (const relPath of allSourceFiles) {
    const fullPath = join(docsRoot, relPath);
    try {
      const hash = await sha256File(fullPath);
      sources[relPath] = {
        sha256: hash,
        feedsInto: fileToOutputs.get(relPath) || [],
      };
    } catch {
      console.warn(`Warning: Source file not found: ${relPath}`);
    }
  }

  // Hash all output files
  const outputFiles = await glob("**/*.md", { cwd: outputDir });
  for (const relPath of outputFiles) {
    const fullPath = join(outputDir, relPath);
    const hash = await sha256File(fullPath);
    const content = await readFile(fullPath, "utf-8");
    const lines = content.split("\n").length;

    // Find which sources generated this output
    const outputKey = relPath.replace(/^refs\//, "");
    const mapping = sourceMappings[outputKey];

    outputs[relPath] = {
      sha256: hash,
      lines,
      generatedFrom: mapping?.sourceFiles || ["template"],
    };
  }

  return {
    version: "1.0.0",
    sourceRepo,
    sourceCommit,
    buildDate: new Date().toISOString(),
    sources,
    outputs,
  };
}

/**
 * Detect drift between current docs and the stored manifest.
 */
export async function detectDrift(
  manifestPath: string,
  docsRoot: string
): Promise<DriftReport> {
  const manifestContent = await readFile(manifestPath, "utf-8");
  const manifest: Manifest = JSON.parse(manifestContent);

  const changed: string[] = [];
  const added: string[] = [];
  const removed: string[] = [];

  // Check every source file in the manifest
  for (const [relPath, entry] of Object.entries(manifest.sources)) {
    const fullPath = join(docsRoot, relPath);
    try {
      await stat(fullPath);
      const currentHash = await sha256File(fullPath);
      if (currentHash !== entry.sha256) {
        changed.push(relPath);
      }
    } catch {
      removed.push(relPath);
    }
  }

  // Check for new files not in manifest
  // Scan the same directories the config maps from
  const docPatterns = [
    "packages/documentation/copy/en/**/*.md",
    "packages/tsconfig-reference/copy/en/**/*.md",
    "packages/glossary/copy/en/**/*.md",
  ];

  for (const pattern of docPatterns) {
    const currentFiles = await glob(pattern, { cwd: docsRoot });
    for (const file of currentFiles) {
      if (!(file in manifest.sources)) {
        added.push(file);
      }
    }
  }

  // Determine which output files are affected by changes
  const affectedOutputs = new Set<string>();
  for (const changedFile of [...changed, ...removed]) {
    const entry = manifest.sources[changedFile];
    if (entry) {
      for (const output of entry.feedsInto) {
        affectedOutputs.add(output);
      }
    }
  }

  const hasDrift = changed.length > 0 || added.length > 0 || removed.length > 0;

  return {
    changed,
    added,
    removed,
    affectedOutputs: [...affectedOutputs],
    hasDrift,
  };
}

/**
 * Write manifest to disk.
 */
export async function writeManifest(
  manifest: Manifest,
  outputPath: string
): Promise<void> {
  const content = JSON.stringify(manifest, null, 2) + "\n";
  await writeFile(outputPath, content, "utf-8");
}

/**
 * Read manifest from disk.
 */
export async function readManifest(manifestPath: string): Promise<Manifest> {
  const content = await readFile(manifestPath, "utf-8");
  return JSON.parse(content);
}

/**
 * Format a drift report for console output.
 */
export function formatDriftReport(report: DriftReport): string {
  const lines: string[] = [];

  if (!report.hasDrift) {
    lines.push("No drift detected. Skill is up-to-date with source docs.");
    return lines.join("\n");
  }

  lines.push("=== Drift Report ===");
  lines.push("");

  if (report.changed.length > 0) {
    lines.push(`Changed files (${report.changed.length}):`);
    for (const f of report.changed) {
      lines.push(`  M ${f}`);
    }
    lines.push("");
  }

  if (report.added.length > 0) {
    lines.push(`New files (${report.added.length}):`);
    for (const f of report.added) {
      lines.push(`  A ${f}`);
    }
    lines.push("");
  }

  if (report.removed.length > 0) {
    lines.push(`Removed files (${report.removed.length}):`);
    for (const f of report.removed) {
      lines.push(`  D ${f}`);
    }
    lines.push("");
  }

  if (report.affectedOutputs.length > 0) {
    lines.push(`Affected skill outputs (${report.affectedOutputs.length}):`);
    for (const f of report.affectedOutputs) {
      lines.push(`  → ${f}`);
    }
  }

  return lines.join("\n");
}
