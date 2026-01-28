/**
 * Source-to-output mappings for the TypeScript skill build pipeline.
 * Maps TypeScript-Website documentation files to condensed reference files.
 */

export interface SourceMapping {
  /** Glob patterns relative to the docs root (TypeScript-Website/) */
  sources: string[];
  /** Maximum lines for the generated output file */
  maxLines: number;
  /** Content priorities: what to keep when condensing */
  priorities: ContentPriority[];
}

export type ContentPriority =
  | "code-examples"
  | "type-rules"
  | "gotchas"
  | "signatures"
  | "patterns"
  | "constraints"
  | "syntax"
  | "options"
  | "templates"
  | "checklists";

const DOC_ROOT = "packages/documentation/copy/en";
const TSCONFIG_ROOT = "packages/tsconfig-reference/copy/en";
const GLOSSARY_ROOT = "packages/glossary/copy/en";

export const REF_FILE_SOURCES: Record<string, SourceMapping> = {
  "type-system-core.md": {
    sources: [
      `${DOC_ROOT}/handbook-v2/Basics.md`,
      `${DOC_ROOT}/handbook-v2/Everyday Types.md`,
      `${DOC_ROOT}/handbook-v2/Narrowing.md`,
      `${DOC_ROOT}/handbook-v2/Object Types.md`,
      `${DOC_ROOT}/reference/Type Compatibility.md`,
      `${DOC_ROOT}/reference/Type Inference.md`,
    ],
    maxLines: 350,
    priorities: ["code-examples", "type-rules", "gotchas"],
  },

  "functions-and-classes.md": {
    sources: [
      `${DOC_ROOT}/handbook-v2/More on Functions.md`,
      `${DOC_ROOT}/handbook-v2/Classes.md`,
      `${DOC_ROOT}/handbook-v2/Type Manipulation/Generics.md`,
    ],
    maxLines: 400,
    priorities: ["signatures", "patterns", "constraints"],
  },

  "type-manipulation.md": {
    sources: [
      `${DOC_ROOT}/handbook-v2/Type Manipulation/_Creating Types from Types.md`,
      `${DOC_ROOT}/handbook-v2/Type Manipulation/Conditional Types.md`,
      `${DOC_ROOT}/handbook-v2/Type Manipulation/Mapped Types.md`,
      `${DOC_ROOT}/handbook-v2/Type Manipulation/Template Literal Types.md`,
      `${DOC_ROOT}/handbook-v2/Type Manipulation/Indexed Access Types.md`,
      `${DOC_ROOT}/handbook-v2/Type Manipulation/Keyof Type Operator.md`,
      `${DOC_ROOT}/handbook-v2/Type Manipulation/Typeof Type Operator.md`,
    ],
    maxLines: 350,
    priorities: ["syntax", "patterns", "code-examples"],
  },

  "utility-types.md": {
    sources: [
      `${DOC_ROOT}/reference/Utility Types.md`,
    ],
    maxLines: 250,
    priorities: ["signatures", "code-examples", "gotchas"],
  },

  "modules-and-namespaces.md": {
    sources: [
      `${DOC_ROOT}/handbook-v2/Modules.md`,
      `${DOC_ROOT}/modules-reference/Introduction.md`,
      `${DOC_ROOT}/modules-reference/Theory.md`,
      `${DOC_ROOT}/modules-reference/Reference.md`,
      `${DOC_ROOT}/reference/Namespaces.md`,
      `${DOC_ROOT}/reference/Namespaces and Modules.md`,
    ],
    maxLines: 300,
    priorities: ["patterns", "gotchas", "code-examples"],
  },

  "tsconfig-guide.md": {
    sources: [
      `${DOC_ROOT}/project-config/tsconfig.json.md`,
      `${DOC_ROOT}/project-config/Compiler Options.md`,
      `${DOC_ROOT}/project-config/Project References.md`,
      `${DOC_ROOT}/project-config/Configuring Watch.md`,
      `${DOC_ROOT}/project-config/Integrating with Build Tools.md`,
      `${DOC_ROOT}/modules-reference/guides/Choosing Compiler Options.md`,
    ],
    maxLines: 300,
    priorities: ["options", "patterns", "gotchas"],
  },

  "tsconfig-options-reference.md": {
    sources: [
      `${TSCONFIG_ROOT}/options/*.md`,
    ],
    maxLines: 400,
    priorities: ["options", "gotchas"],
  },

  "declaration-files.md": {
    sources: [
      `${DOC_ROOT}/declaration-files/Introduction.md`,
      `${DOC_ROOT}/declaration-files/By Example.md`,
      `${DOC_ROOT}/declaration-files/Do's and Don'ts.md`,
      `${DOC_ROOT}/declaration-files/Deep Dive.md`,
      `${DOC_ROOT}/declaration-files/Library Structures.md`,
      `${DOC_ROOT}/declaration-files/Publishing.md`,
      `${DOC_ROOT}/declaration-files/Consumption.md`,
    ],
    maxLines: 200,
    priorities: ["patterns", "gotchas", "code-examples"],
  },

  "code-review-checklist.md": {
    sources: [
      `${DOC_ROOT}/handbook-v2/Basics.md`,
      `${DOC_ROOT}/handbook-v2/Narrowing.md`,
      `${DOC_ROOT}/handbook-v2/Everyday Types.md`,
      `${DOC_ROOT}/reference/Utility Types.md`,
      `${DOC_ROOT}/declaration-files/Do's and Don'ts.md`,
      `${DOC_ROOT}/reference/Enums.md`,
      `${DOC_ROOT}/reference/Decorators.md`,
    ],
    maxLines: 250,
    priorities: ["gotchas", "type-rules", "checklists"],
  },

  "project-templates.md": {
    sources: [
      `${DOC_ROOT}/project-config/tsconfig.json.md`,
      `${DOC_ROOT}/project-config/Compiler Options.md`,
      `${TSCONFIG_ROOT}/options/*.md`,
    ],
    maxLines: 300,
    priorities: ["templates", "options", "patterns"],
  },
};

/**
 * SKILL.md is generated from a template, not directly from docs.
 * This lists additional source files whose content informs the template.
 */
export const SKILL_TEMPLATE_SOURCES: string[] = [
  `${DOC_ROOT}/get-started/TS for JS Programmers.md`,
  `${DOC_ROOT}/get-started/TS for the New Programmer.md`,
  `${GLOSSARY_ROOT}/*.md`,
];

/** Files to exclude from manifest source tracking (not documentation content) */
export const EXCLUDED_PATTERNS: string[] = [
  "**/node_modules/**",
  "**/.git/**",
  "**/package.json",
  "**/tsconfig.json",
];

/** The docs root directory name (cloned repo) */
export const DOCS_REPO_DIR = "TypeScript-Website";

/** Output skill directory relative to project root */
export const SKILL_OUTPUT_DIR = ".claude/skills/typescript";
