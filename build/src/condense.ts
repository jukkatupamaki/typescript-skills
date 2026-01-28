/**
 * Content condensation engine.
 * Compresses TypeScript documentation into skill-sized reference content.
 */

import type { Section, CodeBlock, DocFile } from "./extract.js";
import { cleanTwoslash, stripHtml, getTitle } from "./extract.js";
import type { ContentPriority } from "./config.js";

/**
 * Condense an entire doc file into a summarized string within a line budget.
 */
export function condenseDoc(doc: DocFile, lineBudget: number, priorities: ContentPriority[]): string {
  const title = getTitle(doc);
  const sections = doc.sections.filter((s) => s.heading || s.content.trim());

  // Allocate budget across sections proportionally
  const totalContentLines = sections.reduce(
    (sum, s) => sum + s.content.split("\n").length,
    0
  );

  // Reserve 2 lines for title
  let remaining = lineBudget - 2;
  const parts: string[] = [`## ${title}`, ""];

  for (const section of sections) {
    if (remaining <= 0) break;

    const sectionLines = section.content.split("\n").length;
    const sectionBudget = Math.max(
      3,
      Math.floor((sectionLines / Math.max(totalContentLines, 1)) * (lineBudget - 2))
    );
    const budget = Math.min(sectionBudget, remaining);

    const condensed = condenseSection(section, budget, priorities);
    if (condensed.trim()) {
      parts.push(condensed);
      remaining -= condensed.split("\n").length;
    }
  }

  return parts.join("\n");
}

/**
 * Condense a single section within a line budget.
 */
export function condenseSection(
  section: Section,
  budget: number,
  priorities: ContentPriority[]
): string {
  const parts: string[] = [];

  // Add heading if present
  if (section.heading) {
    const prefix = "#".repeat(Math.min(section.level + 1, 4)); // Shift down since doc title is ##
    parts.push(`${prefix} ${section.heading}`);
    parts.push("");
  }

  // Clean and process prose
  const cleanedContent = stripHtml(section.content);
  const prose = removeCodeBlocks(cleanedContent);
  const proseLines = prose.split("\n").filter((l) => l.trim());

  // Budget allocation: ~60% prose, ~40% code
  const proseBudget = Math.floor(budget * 0.6);
  const codeBudget = budget - proseBudget;

  // Condense prose
  if (proseLines.length > proseBudget) {
    // Aggressive: convert to bullet points using first sentence of each paragraph
    const paragraphs = splitParagraphs(prose);
    for (const para of paragraphs) {
      if (parts.length >= proseBudget + 2) break; // +2 for heading
      const firstSentence = extractFirstSentence(para);
      if (firstSentence) {
        parts.push(`- ${firstSentence}`);
      }
    }
  } else {
    // Fits within budget, keep as-is but trim blank lines
    for (const line of proseLines) {
      if (parts.length >= proseBudget + 2) break;
      parts.push(line);
    }
  }

  // Add best code example
  if (codeBudget > 2) {
    const bestBlock = selectBestCodeBlock(section.codeBlocks, priorities);
    if (bestBlock) {
      const cleaned = cleanTwoslash(bestBlock.content);
      const codeLines = cleaned.split("\n");
      if (codeLines.length <= codeBudget - 2) {
        parts.push("");
        parts.push(`\`\`\`ts`);
        parts.push(...codeLines);
        parts.push("```");
      }
    }
  }

  return parts.join("\n");
}

/**
 * Condense TSConfig options from individual option files.
 * Each option becomes 2-3 lines: display name, oneline description, and default.
 */
export function condenseTsconfigOption(doc: DocFile): string {
  const display = (doc.frontmatter.display as string) || getTitle(doc);
  const oneline = (doc.frontmatter.oneline as string) || "";

  // Extract default value and allowed values from content
  const defaultMatch = doc.rawContent.match(
    /(?:default|Default)[:\s]+`?([^`\n]+)`?/i
  );
  const defaultVal = defaultMatch ? defaultMatch[1].trim() : "";

  let line = `- **${display}**`;
  if (oneline) line += `: ${oneline}`;
  if (defaultVal) line += ` Default: \`${defaultVal}\`.`;

  return line;
}

/**
 * Generate the code review checklist reference from doc content.
 * Extracts do's/don'ts, common pitfalls, and best practices.
 */
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
  ];

  // Extract Do's and Don'ts from declaration file guide
  for (const doc of docs) {
    if (doc.path.includes("Do's and Don'ts")) {
      for (const section of doc.sections) {
        if (
          section.heading.toLowerCase().includes("don't") ||
          section.heading.toLowerCase().includes("do ")
        ) {
          const cleaned = stripHtml(section.content);
          const bullets = splitParagraphs(cleaned)
            .slice(0, 3)
            .map((p) => `- ${extractFirstSentence(p)}`)
            .filter((b) => b.length > 3);
          if (bullets.length > 0) {
            parts.push(`### ${section.heading}`);
            parts.push(...bullets);
            parts.push("");
          }
        }
      }
    }
  }

  parts.push("## Common Anti-Patterns");
  parts.push("- Using `Object`, `Function`, `String` (uppercase) instead of `object`, `Function`, `string`");
  parts.push("- Overusing type assertions to silence errors instead of fixing types");
  parts.push("- Not narrowing union types before access");
  parts.push("- Using `!` non-null assertion without guarantees");
  parts.push("- Ignoring `strictNullChecks` errors with optional chaining when null is a real concern");
  parts.push("- Using `@ts-ignore` instead of `@ts-expect-error`");
  parts.push("- Barrel files that break tree-shaking");
  parts.push("");
  parts.push("## Module Best Practices");
  parts.push("- Use `nodenext` module resolution for Node.js projects");
  parts.push("- Use `bundler` module resolution for frontend bundler projects");
  parts.push("- Prefer explicit file extensions in imports for ESM");
  parts.push("- Use `type` imports (`import type { X }`) for type-only imports");
  parts.push("- Avoid namespace imports when tree-shaking matters");

  return parts.join("\n");
}

/**
 * Generate project template configurations.
 */
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

function removeCodeBlocks(content: string): string {
  return content.replace(/```[\s\S]*?```/g, "").trim();
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

function extractFirstSentence(paragraph: string): string {
  // Normalize whitespace
  const normalized = paragraph.replace(/\s+/g, " ").trim();
  const match = normalized.match(/^[^.!?]+[.!?]/);
  return match ? match[0].trim() : normalized.slice(0, 120);
}

function selectBestCodeBlock(
  blocks: CodeBlock[],
  priorities: ContentPriority[]
): CodeBlock | null {
  const tsBlocks = blocks.filter(
    (b) => b.lang === "ts" || b.lang === "typescript" || b.lang === "tsx"
  );
  if (tsBlocks.length === 0) return null;

  // Prefer blocks between 2-15 lines (meaningful but concise)
  const ideal = tsBlocks
    .filter((b) => b.lines >= 2 && b.lines <= 15)
    .sort((a, b) => a.lines - b.lines);

  return ideal[0] || tsBlocks.sort((a, b) => a.lines - b.lines)[0];
}
