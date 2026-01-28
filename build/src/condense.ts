/**
 * Content condensation engine.
 * Extracts code examples, rules, and patterns from TypeScript documentation.
 * Discards tutorial prose — keeps only what an AI can act on.
 */

import type { Section, CodeBlock, DocFile } from "./extract.js";
import { cleanTwoslash, stripHtml, stripLinks, getTitle } from "./extract.js";

// --- Types ---

export interface CodeExample {
  heading: string;
  code: string;
  annotation?: "wrong" | "right" | "info";
  lines: number;
}

export interface Rule {
  heading: string;
  type: "do" | "dont" | "info";
  text: string;
}

/** Generic headings that should be replaced by their parent heading */
const GENERIC_HEADINGS = new Set([
  "example", "examples", "try", "try it", "usage", "syntax",
  "description", "details", "see also", "note", "notes",
]);

/**
 * Resolve a section's heading: use parent heading if the section heading is generic.
 */
function resolveHeading(section: { heading: string; parentHeading: string }, fallback: string): string {
  const heading = stripLinks(section.heading || fallback);
  if (GENERIC_HEADINGS.has(heading.toLowerCase().replace(/[`#]/g, "").trim())) {
    const parent = stripLinks(section.parentHeading);
    if (parent) return parent;
  }
  return heading;
}

// --- Main extraction ---

/**
 * Extract all TypeScript code examples from a doc, tagged with their heading.
 */
export function extractCodeExamples(doc: DocFile): CodeExample[] {
  const examples: CodeExample[] = [];

  for (const section of doc.sections) {
    const heading = resolveHeading(section, getTitle(doc));

    for (const block of section.codeBlocks) {
      if (!isTypeScriptBlock(block)) continue;

      const cleaned = cleanTwoslash(block.content);
      if (!cleaned.trim()) continue;

      const annotation = detectAnnotation(block, section.content);

      examples.push({
        heading,
        code: cleaned,
        annotation,
        lines: cleaned.split("\n").length,
      });
    }
  }

  return examples;
}

/**
 * Extract actionable rules from a doc (do/don't markers, prescriptive list items).
 */
export function extractRules(doc: DocFile): Rule[] {
  const rules: Rule[] = [];

  for (const section of doc.sections) {
    const heading = resolveHeading(section, getTitle(doc));
    const content = stripLinks(stripHtml(section.content));
    const lines = content.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Detect ❌/✅ emoji markers
      if (trimmed.startsWith("❌") || trimmed.includes("**Don't**") || trimmed.includes("_Don't_")) {
        rules.push({
          heading,
          type: "dont",
          text: cleanRuleText(trimmed),
        });
        continue;
      }

      if (trimmed.startsWith("✅") || trimmed.match(/^\*\*Do\*\*\s/)) {
        rules.push({
          heading,
          type: "do",
          text: cleanRuleText(trimmed),
        });
        continue;
      }

      // Detect prescriptive list items: "- Always...", "- Never...", "- Prefer...", "- Avoid...", "- Use X instead..."
      if (trimmed.match(/^[-*]\s+(Always|Never|Prefer|Avoid|Do not|Don't|Use\s+\S+\s+instead)\b/i)) {
        rules.push({
          heading,
          type: trimmed.match(/^[-*]\s+(Never|Avoid|Do not|Don't)\b/i) ? "dont" : "do",
          text: cleanRuleText(trimmed),
        });
      }
    }
  }

  return rules;
}

/**
 * Format extracted code examples and rules into a reference file within a line budget.
 */
export function formatRefFile(
  title: string,
  docs: { doc: DocFile; examples: CodeExample[]; rules: Rule[] }[],
  maxLines: number
): string {
  const parts: string[] = [`# ${title}`, ""];
  let lineCount = 2;

  for (const { doc, examples, rules } of docs) {
    const docTitle = getTitle(doc);

    // Group examples and rules by heading
    const headings = new Map<string, { examples: CodeExample[]; rules: Rule[] }>();

    for (const ex of examples) {
      if (!headings.has(ex.heading)) headings.set(ex.heading, { examples: [], rules: [] });
      headings.get(ex.heading)!.examples.push(ex);
    }
    for (const rule of rules) {
      if (!headings.has(rule.heading)) headings.set(rule.heading, { examples: [], rules: [] });
      headings.get(rule.heading)!.rules.push(rule);
    }

    // Skip docs that yielded nothing
    if (headings.size === 0) continue;

    // Doc-level heading
    parts.push(`## ${stripLinks(docTitle)}`);
    parts.push("");
    lineCount += 2;

    for (const [heading, group] of headings) {
      if (lineCount >= maxLines - 5) break;

      // Section heading (only if different from doc title)
      if (heading !== docTitle) {
        parts.push(`### ${heading}`);
        parts.push("");
        lineCount += 2;
      }

      // Rules first (they provide context for the code)
      for (const rule of group.rules) {
        if (lineCount >= maxLines - 3) break;
        const prefix = rule.type === "dont" ? "- DON'T: " : rule.type === "do" ? "- DO: " : "- ";
        parts.push(`${prefix}${rule.text}`);
        lineCount += 1;
      }

      if (group.rules.length > 0 && group.examples.length > 0) {
        parts.push("");
        lineCount += 1;
      }

      // Best code example for this heading
      const best = selectBestExample(group.examples);
      if (best && lineCount + best.lines + 3 < maxLines) {
        if (best.annotation === "wrong") {
          parts.push("Wrong:");
          lineCount += 1;
        } else if (best.annotation === "right") {
          parts.push("Right:");
          lineCount += 1;
        }
        parts.push("```ts");
        parts.push(best.code);
        parts.push("```");
        parts.push("");
        lineCount += best.lines + 3;

        // If we showed a "wrong" example, try to show the "right" one too
        if (best.annotation === "wrong") {
          const right = group.examples.find(
            (e) => e.annotation === "right" && e !== best
          );
          if (right && lineCount + right.lines + 4 < maxLines) {
            parts.push("Right:");
            parts.push("```ts");
            parts.push(right.code);
            parts.push("```");
            parts.push("");
            lineCount += right.lines + 4;
          }
        }
      }
    }
  }

  return parts.join("\n");
}

// --- TSConfig (unchanged) ---

/**
 * Condense TSConfig options from individual option files.
 */
export function condenseTsconfigOption(doc: DocFile): string {
  const display = (doc.frontmatter.display as string) || getTitle(doc);
  const oneline = (doc.frontmatter.oneline as string) || "";
  const defaultMatch = doc.rawContent.match(
    /(?:default|Default)[:\s]+`?([^`\n]+)`?/i
  );
  const defaultVal = defaultMatch ? defaultMatch[1].trim() : "";

  let line = `- **${display}**`;
  if (oneline) line += `: ${oneline}`;
  if (defaultVal) line += ` Default: \`${defaultVal}\`.`;
  return line;
}

// --- Hand-authored generators (unchanged) ---

export function generateReviewContent(docs: DocFile[]): string {
  const parts: string[] = [
    "# TypeScript Code Review Checklist",
    "",
    "## Strict Mode and Type Safety",
    "- Always enable `strict: true` in tsconfig.json",
    "- Never use `any` — prefer `unknown` and narrow with type guards",
    "- Avoid type assertions (`as`) unless unavoidable; prefer type narrowing",
    "- Use `satisfies` operator to validate types without widening",
    "- Enable `noUncheckedIndexedAccess` for safer array/object access",
    "",
    "## Type Design",
    "- Prefer discriminated unions over optional properties for state variants",
    "- Use `interface` for object shapes that may be extended, `type` for unions/intersections/mapped types",
    "- Prefer `readonly` properties and `ReadonlyArray` for immutable data",
    "- Use branded types for domain values that shouldn't be interchangeable (e.g., UserId vs OrderId)",
    "- Avoid `enum` in most cases — prefer `as const` objects or union types",
    "",
    "## Functions",
    "- Add explicit return types on exported functions",
    "- Use function overloads only when the return type varies by input type",
    "- Prefer generic constraints (`T extends X`) over `any` parameters",
    "- Use `never` for exhaustiveness checks in switch/if-else chains",
    "",
    "## Error Handling",
    "- Type catch clause variables as `unknown`, not `any`",
    "- Create typed error classes or discriminated error unions",
    "- Use `Result<T, E>` patterns for expected failures instead of exceptions",
    "",
    "## Common Anti-Patterns",
    "- Using `Object`, `Function`, `String` (uppercase) instead of `object`, `Function`, `string`",
    "- Overusing type assertions to silence errors instead of fixing types",
    "- Not narrowing union types before access",
    "- Using non-null assertion operator without guarantees",
    "- Ignoring `strictNullChecks` errors with optional chaining when null is a real concern",
    "- Using `@ts-ignore` instead of `@ts-expect-error`",
    "- Barrel files that break tree-shaking",
    "",
    "## Module Best Practices",
    "- Use `nodenext` module resolution for Node.js projects",
    "- Use `bundler` module resolution for frontend bundler projects",
    "- Prefer explicit file extensions in imports for ESM",
    "- Use `type` imports (`import type { X }`) for type-only imports",
    "- Avoid namespace imports when tree-shaking matters",
  ];

  // Extract Do's and Don'ts rules with code examples from source docs
  for (const doc of docs) {
    if (!doc.path.includes("Do's and Don'ts")) continue;

    const examples = extractCodeExamples(doc);
    const rules = extractRules(doc);

    if (rules.length === 0) continue;

    parts.push("");
    parts.push("## Declaration File Rules");
    parts.push("");

    for (const rule of rules) {
      const prefix = rule.type === "dont" ? "- DON'T: " : rule.type === "do" ? "- DO: " : "- ";
      parts.push(`${prefix}${rule.text}`);
    }

    // Add a few key wrong/right code pairs
    const wrongExamples = examples.filter((e) => e.annotation === "wrong");
    const rightExamples = examples.filter((e) => e.annotation === "right");

    for (let i = 0; i < Math.min(wrongExamples.length, 3); i++) {
      const wrong = wrongExamples[i];
      const right = rightExamples[i];
      if (wrong && right && wrong.lines <= 5 && right.lines <= 5) {
        parts.push("");
        parts.push("Wrong:");
        parts.push("```ts");
        parts.push(wrong.code);
        parts.push("```");
        parts.push("Right:");
        parts.push("```ts");
        parts.push(right.code);
        parts.push("```");
      }
    }
  }

  return parts.join("\n");
}

export function generateProjectTemplates(docs: DocFile[]): string {
  return [
    "# TypeScript Project Templates",
    "",
    "## Node.js Backend (v20+)",
    "```json",
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          module: "nodenext",
          moduleResolution: "nodenext",
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          outDir: "./dist",
          rootDir: "./src",
          declaration: true,
          declarationMap: true,
          sourceMap: true,
          resolveJsonModule: true,
          isolatedModules: true,
          forceConsistentCasingInFileNames: true,
          noUncheckedIndexedAccess: true,
        },
        include: ["src/**/*"],
        exclude: ["node_modules", "dist"],
      },
      null,
      2
    ),
    "```",
    "",
    "## React Application (Vite / Bundler)",
    "```json",
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2020",
          module: "preserve",
          moduleResolution: "bundler",
          jsx: "react-jsx",
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          outDir: "./dist",
          rootDir: "./src",
          declaration: true,
          sourceMap: true,
          isolatedModules: true,
          forceConsistentCasingInFileNames: true,
          noUncheckedIndexedAccess: true,
          lib: ["ES2020", "DOM", "DOM.Iterable"],
        },
        include: ["src/**/*"],
        exclude: ["node_modules", "dist"],
      },
      null,
      2
    ),
    "```",
    "",
    "## Library (npm package)",
    "```json",
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2020",
          module: "nodenext",
          moduleResolution: "nodenext",
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          outDir: "./dist",
          rootDir: "./src",
          declaration: true,
          declarationMap: true,
          sourceMap: true,
          isolatedModules: true,
          forceConsistentCasingInFileNames: true,
          noUncheckedIndexedAccess: true,
        },
        include: ["src/**/*"],
        exclude: ["node_modules", "dist", "**/*.test.ts"],
      },
      null,
      2
    ),
    "```",
    "",
    "## Monorepo (shared base)",
    "```json",
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          module: "nodenext",
          moduleResolution: "nodenext",
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          declaration: true,
          declarationMap: true,
          sourceMap: true,
          composite: true,
          isolatedModules: true,
          forceConsistentCasingInFileNames: true,
          noUncheckedIndexedAccess: true,
        },
      },
      null,
      2
    ),
    "```",
    "",
    "Each sub-package extends this base and adds `outDir`, `rootDir`, `references`.",
    "",
    "## Setup Steps",
    "",
    "1. Initialize: `npm init -y && npm install -D typescript`",
    "2. Create tsconfig: choose template above, save as `tsconfig.json`",
    "3. Create `src/` directory with `index.ts`",
    "4. Add scripts to `package.json`:",
    '   - `"build": "tsc"`',
    '   - `"dev": "tsc --watch"`',
    '   - `"typecheck": "tsc --noEmit"`',
    "5. For ESM projects, add `\"type\": \"module\"` to `package.json`",
    "6. Install type definitions for dependencies: `npm install -D @types/node`",
  ].join("\n");
}

// --- Internal helpers ---

function isTypeScriptBlock(block: CodeBlock): boolean {
  return block.lang === "ts" || block.lang === "typescript" || block.lang === "tsx";
}

function detectAnnotation(
  block: CodeBlock,
  sectionContent: string
): "wrong" | "right" | "info" | undefined {
  // Check code comments for WRONG/OK/DO NOT markers
  if (block.content.match(/\/\*\s*WRONG\s*\*\//i) || block.content.match(/DON'T DO THIS/i)) {
    return "wrong";
  }
  if (block.content.match(/\/\*\s*OK\s*\*\//i) || block.content.match(/\/\*\s*RIGHT\s*\*\//i)) {
    return "right";
  }

  // Check surrounding text for ❌/✅ markers
  // Find the position of this code block in the section content
  const codeInContent = sectionContent.indexOf(block.content.slice(0, 40));
  if (codeInContent >= 0) {
    const before = sectionContent.slice(Math.max(0, codeInContent - 200), codeInContent);
    if (before.includes("❌") || before.match(/\*\*Don't\*\*/)) return "wrong";
    if (before.includes("✅") || before.match(/\*\*Do\*\*\s/)) return "right";
  }

  return undefined;
}

function cleanRuleText(text: string): string {
  return text
    .replace(/^[-*]\s+/, "")           // Remove list marker
    .replace(/^[❌✅]\s*/, "")          // Remove emoji
    .replace(/^\*\*(Don't|Do)\*\*\s*/, "") // Remove bold Do/Don't
    .replace(/^_?(Don't|Do)_?\s*/, "")     // Remove italic Do/Don't
    .trim();
}

function selectBestExample(examples: CodeExample[]): CodeExample | null {
  if (examples.length === 0) return null;

  // Prefer "wrong" examples (they pair with "right" ones and show contrast)
  const wrong = examples.find((e) => e.annotation === "wrong");
  if (wrong && wrong.lines <= 12) return wrong;

  // Then prefer examples in the 3-12 line sweet spot
  const ideal = examples
    .filter((e) => e.lines >= 3 && e.lines <= 12)
    .sort((a, b) => a.lines - b.lines);
  if (ideal.length > 0) return ideal[0];

  // Fall back to shortest
  return examples.sort((a, b) => a.lines - b.lines)[0];
}
