/**
 * Reference file generator.
 * Reads source docs, condenses them, and writes output reference files.
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { glob } from "glob";
import { REF_FILE_SOURCES, type SourceMapping } from "./config.js";
import { extractDoc, type DocFile } from "./extract.js";
import {
  condenseDoc,
  condenseTsconfigOption,
  generateReviewContent,
  generateProjectTemplates,
} from "./condense.js";

export interface GeneratedRef {
  filename: string;
  content: string;
  sourceFiles: string[];
}

/**
 * Generate all reference files from the docs source.
 */
export async function generateAllRefs(docsRoot: string): Promise<GeneratedRef[]> {
  const results: GeneratedRef[] = [];

  for (const [filename, mapping] of Object.entries(REF_FILE_SOURCES)) {
    const ref = await generateRef(filename, mapping, docsRoot);
    results.push(ref);
  }

  return results;
}

async function generateRef(
  filename: string,
  mapping: SourceMapping,
  docsRoot: string
): Promise<GeneratedRef> {
  // Resolve glob patterns to actual files
  const resolvedPaths: string[] = [];
  for (const pattern of mapping.sources) {
    if (pattern.includes("*")) {
      const matches = await glob(pattern, { cwd: docsRoot });
      resolvedPaths.push(...matches.sort());
    } else {
      resolvedPaths.push(pattern);
    }
  }

  // Read and parse all source files
  const docs: DocFile[] = [];
  for (const relPath of resolvedPaths) {
    const fullPath = join(docsRoot, relPath);
    try {
      const raw = await readFile(fullPath, "utf-8");
      docs.push(extractDoc(relPath, raw));
    } catch {
      console.warn(`Warning: Could not read ${fullPath}, skipping`);
    }
  }

  // Special handling for specific reference files
  let content: string;

  if (filename === "code-review-checklist.md") {
    content = generateReviewContent(docs);
  } else if (filename === "project-templates.md") {
    content = generateProjectTemplates(docs);
  } else if (filename === "tsconfig-options-reference.md") {
    content = generateTsconfigReference(docs);
  } else {
    content = generateStandardRef(filename, docs, mapping);
  }

  // Enforce line budget
  const lines = content.split("\n");
  if (lines.length > mapping.maxLines) {
    content = lines.slice(0, mapping.maxLines).join("\n") + "\n\n<!-- truncated -->";
  }

  return {
    filename,
    content,
    sourceFiles: resolvedPaths,
  };
}

function generateStandardRef(
  filename: string,
  docs: DocFile[],
  mapping: SourceMapping
): string {
  const title = filename.replace(/\.md$/, "").replace(/-/g, " ");
  const parts: string[] = [`# ${titleCase(title)}`, ""];

  // Distribute line budget across docs
  const perDocBudget = Math.floor(mapping.maxLines / Math.max(docs.length, 1));

  for (const doc of docs) {
    const condensed = condenseDoc(doc, perDocBudget, mapping.priorities);
    if (condensed.trim()) {
      parts.push(condensed);
      parts.push("");
    }
  }

  return parts.join("\n");
}

function generateTsconfigReference(docs: DocFile[]): string {
  // Group options by category based on content patterns
  const categories: Record<string, string[]> = {
    "Type Checking": [],
    "Modules": [],
    "Emit": [],
    "JavaScript Support": [],
    "Interop Constraints": [],
    "Language and Environment": [],
    "Completeness": [],
    "Other": [],
  };

  // Known category mappings for common options
  const categoryMap: Record<string, string> = {
    strict: "Type Checking",
    strictNullChecks: "Type Checking",
    strictFunctionTypes: "Type Checking",
    strictBindCallApply: "Type Checking",
    strictPropertyInitialization: "Type Checking",
    noImplicitAny: "Type Checking",
    noImplicitThis: "Type Checking",
    noImplicitReturns: "Type Checking",
    noFallthroughCasesInSwitch: "Type Checking",
    noUncheckedIndexedAccess: "Type Checking",
    noPropertyAccessFromIndexSignature: "Type Checking",
    exactOptionalPropertyTypes: "Type Checking",
    noImplicitOverride: "Type Checking",
    alwaysStrict: "Type Checking",
    allowUnusedLabels: "Type Checking",
    allowUnreachableCode: "Type Checking",

    module: "Modules",
    moduleResolution: "Modules",
    baseUrl: "Modules",
    paths: "Modules",
    rootDir: "Modules",
    rootDirs: "Modules",
    typeRoots: "Modules",
    types: "Modules",
    resolveJsonModule: "Modules",
    resolvePackageJsonExports: "Modules",
    resolvePackageJsonImports: "Modules",
    customConditions: "Modules",
    moduleSuffixes: "Modules",
    allowImportingTsExtensions: "Modules",

    target: "Language and Environment",
    lib: "Language and Environment",
    jsx: "Language and Environment",
    jsxFactory: "Language and Environment",
    jsxFragmentFactory: "Language and Environment",
    jsxImportSource: "Language and Environment",
    experimentalDecorators: "Language and Environment",
    emitDecoratorMetadata: "Language and Environment",
    useDefineForClassFields: "Language and Environment",

    outDir: "Emit",
    outFile: "Emit",
    declaration: "Emit",
    declarationMap: "Emit",
    declarationDir: "Emit",
    sourceMap: "Emit",
    inlineSourceMap: "Emit",
    inlineSources: "Emit",
    noEmit: "Emit",
    noEmitOnError: "Emit",
    removeComments: "Emit",
    importHelpers: "Emit",
    downlevelIteration: "Emit",
    emitBOM: "Emit",
    newLine: "Emit",
    stripInternal: "Emit",
    preserveConstEnums: "Emit",
    emitDeclarationOnly: "Emit",
    sourceRoot: "Emit",
    mapRoot: "Emit",

    allowJs: "JavaScript Support",
    checkJs: "JavaScript Support",
    maxNodeModuleJsDepth: "JavaScript Support",

    esModuleInterop: "Interop Constraints",
    allowSyntheticDefaultImports: "Interop Constraints",
    forceConsistentCasingInFileNames: "Interop Constraints",
    isolatedModules: "Interop Constraints",
    verbatimModuleSyntax: "Interop Constraints",

    skipLibCheck: "Completeness",
    skipDefaultLibCheck: "Completeness",
    composite: "Completeness",
    incremental: "Completeness",
    tsBuildInfoFile: "Completeness",
    disableSourceOfProjectReferenceRedirect: "Completeness",
    disableSolutionSearching: "Completeness",
    disableReferencedProjectLoad: "Completeness",
  };

  for (const doc of docs) {
    const optionName = doc.path.replace(/.*\//, "").replace(/\.md$/, "");
    const line = condenseTsconfigOption(doc);
    const category = categoryMap[optionName] || "Other";
    if (!categories[category]) categories[category] = [];
    categories[category].push(line);
  }

  const parts: string[] = ["# TSConfig Options Reference", ""];

  for (const [category, options] of Object.entries(categories)) {
    if (options.length === 0) continue;
    parts.push(`## ${category}`);
    parts.push("");
    parts.push(...options.sort());
    parts.push("");
  }

  return parts.join("\n");
}

function titleCase(str: string): string {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}
