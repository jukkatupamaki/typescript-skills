# docs-to-skills

Build Claude Code skills from official documentation. Transform large doc repositories into concise, versioned, auto-updating AI skills with integrity tracking and automated testing.

## What is this?

docs-to-skills is a build system that reads official documentation repositories and generates [Claude Code skills](https://code.claude.com/docs/en/skills) from them. Each skill is a condensed, structured knowledge base that Claude can use to write, review, and scaffold code following the latest official best practices.

The first skill built with this system is **TypeScript** — generated from Microsoft's [TypeScript-Website](https://github.com/microsoft/TypeScript-Website) documentation (173 source files condensed into 10 reference files with a 128-line SKILL.md router).

### Why not just let Claude use its training data?

Claude already knows TypeScript. But training data goes stale, mixes opinions from blog posts with official docs, and has no version tracking. This skill:

- **Pins to a specific docs commit** — you know exactly which version of the TypeScript docs the skill reflects
- **Detects drift** — SHA-256 checksums on every source file alert you when upstream docs change
- **Encodes specific opinions** — strict mode always on, no `any`, prefer `as const` over enums, `nodenext` module resolution — choices that are documented but not always the default advice
- **Provides structured review** — a severity-categorized checklist (Critical/Warning/Info) that produces consistent code review output

## Quick start

### Use the TypeScript skill in Claude Code

Copy the skill into your project:

```bash
cp -r .claude/skills/typescript /path/to/your/project/.claude/skills/
```

Or make it available globally:

```bash
mkdir -p ~/.claude/skills
ln -s "$(pwd)/.claude/skills/typescript" ~/.claude/skills/typescript
```

Then in Claude Code:

```
/typescript create a generic Result type with map and flatMap
/typescript review
/typescript setup node
```

### Rebuild the skill from source

```bash
# Clone the TypeScript documentation
git clone https://github.com/microsoft/TypeScript-Website.git

# Install dependencies
npm install

# Build the skill
npm run build

# Verify integrity
npm test
```

## How it works

### Build pipeline

The build pipeline reads markdown files from a cloned documentation repository, extracts and condenses the content, and generates Claude Code skill files.

```
TypeScript-Website/           npm run build          .claude/skills/typescript/
  173 markdown files    ──────────────────────>       SKILL.md (128 lines)
  ~55,000 lines                                       10 ref files (1,709 lines)
                                                      manifest.json (SHA-256 checksums)
```

**Pipeline stages:**

1. **Extract** — Parse markdown frontmatter, split by headings, extract code blocks, identify twoslash annotations
2. **Condense** — Strip HTML, clean twoslash directives, convert prose to bullet summaries, select best code examples, enforce line budgets (~18:1 compression ratio)
3. **Generate** — Produce SKILL.md with mode routing (create/review/setup) and 10 topic-specific reference files
4. **Manifest** — Compute SHA-256 checksums for all 173 source files and 11 output files, record the source commit hash

### Skill structure

```
.claude/skills/typescript/
  SKILL.md                          # Router + 15 core TypeScript principles
  refs/
    type-system-core.md             # Types, narrowing, everyday types
    functions-and-classes.md         # Functions, classes, generics
    type-manipulation.md            # Mapped, conditional, template literal types
    utility-types.md                # Partial, Pick, Omit, Record, etc.
    modules-and-namespaces.md       # ESM, CJS, module resolution
    tsconfig-guide.md               # tsconfig.json structure and key options
    tsconfig-options-reference.md   # All 135 compiler options condensed
    declaration-files.md            # .d.ts authoring guide
    code-review-checklist.md        # Severity-categorized review rules
    project-templates.md            # Ready-made tsconfig.json templates
```

Claude Code loads the skill in three stages:

- **Level 1** — Frontmatter only (~100 tokens). Always visible so Claude knows the skill exists.
- **Level 2** — Full SKILL.md body. Loaded when the skill is invoked. Contains mode routing and core principles.
- **Level 3** — Reference files. Declared in the `context:` frontmatter field and loaded alongside the skill.

### Three modes

**Create** — Generate TypeScript code from a description. Claude reads the relevant reference files (type system, generics, utility types) and produces complete, strict-mode-compliant code.

```
/typescript create a generic function that filters an array by type predicate
```

**Review** — Analyze existing TypeScript code against a structured checklist. Outputs findings categorized as Critical (type safety violations), Warning (code quality), and Info (improvements).

```
/typescript review
```

**Setup** — Scaffold a TypeScript project with the correct tsconfig.json for your target (Node.js, React, library, monorepo). Installs dependencies and verifies compilation.

```
/typescript setup node backend with Express
```

## Versioning and integrity

Every build produces a `manifest.json` that records:

- **Source commit** — The exact TypeScript-Website git commit the skill was built from
- **Source checksums** — SHA-256 hash for each of the 173 source markdown files
- **Output checksums** — SHA-256 hash for each of the 11 generated skill files
- **Traceability** — Which source files feed into which output files (`feedsInto` / `generatedFrom`)

### Detect drift

```bash
npm run check
```

Compares current documentation files against the stored manifest. Exits with code 1 if any source file has changed, been added, or been removed. Reports which output files are affected.

### Dry-run rebuild

```bash
npm run diff
```

Shows what would change without writing any files.

## Testing

### Structural tests

```bash
npm test
```

18 tests validating:

- Manifest checksums match current files
- SKILL.md has valid frontmatter and is under 500 lines
- All reference files exist and are within their line budgets
- Build is idempotent (rebuild produces identical output)

### SDK evaluation tests

```bash
ANTHROPIC_API_KEY=sk-... npm run test:eval
```

10 scenarios that send prompts to the Anthropic API with the skill as system context and evaluate responses:

| Scenario | Mode | Checks |
|---|---|---|
| Generic filter function | create | Compiles strict, no any, uses generics + type predicate |
| React component | create | No any, uses generics, defines props type |
| Type guard + Result type | create | Compiles strict, uses never, uses type predicate |
| Error handling system | create | Compiles strict, uses unknown in catch, uses extends |
| Excessive any usage | review | Identifies any, suggests unknown, flags ts-ignore |
| Missing strict mode | review | Flags missing strict, comments on enums, catches non-exhaustive switch |
| Unsafe type assertions | review | Identifies assertions, suggests narrowing, flags non-null |
| Node.js backend | setup | Valid tsconfig, nodenext, strict, modern ES target |
| React application | setup | Valid tsconfig, bundler module, strict, JSX configured |
| npm library | setup | Valid tsconfig, declarations enabled, strict, source maps |

Run a single scenario:

```bash
ANTHROPIC_API_KEY=sk-... npx tsx test/eval/runner.ts --scenario setup-node
```

## CI/CD

Three GitHub Actions workflows:

### Test on PR (`test-skill.yml`)

Runs structural tests on every pull request. Evaluation tests run on push to main or when the PR has the `run-eval` label.

### Weekly upstream check (`check-upstream.yml`)

Every Monday, clones the latest TypeScript-Website, runs drift detection, and creates a GitHub issue if the docs have changed. Updates the existing issue if one is already open.

### Rebuild on demand (`rebuild-skill.yml`)

Manual workflow dispatch. Accepts an optional commit SHA to build from. Runs the full pipeline, tests the output, and opens a pull request with the updated skill files.

## Project structure

```
docs-to-skills/
  build/src/
    index.ts              # CLI: --build | --check | --diff
    config.ts             # Source-to-output file mappings and line budgets
    extract.ts            # Markdown parser (frontmatter, sections, code blocks)
    condense.ts           # Content compression engine
    generate-skill.ts     # SKILL.md template generator
    generate-refs.ts      # Reference file generator
    manifest.ts           # SHA-256 hashing and drift detection
  test/
    structural/           # 18 vitest tests (free, fast, no API key)
    eval/                 # 10 SDK scenarios (needs ANTHROPIC_API_KEY)
  .claude/skills/typescript/   # Generated skill output
  .github/workflows/          # CI/CD pipelines
  manifest.json               # Version tracking and checksums
```

## Building skills from other documentation

The architecture is designed to be extended to other documentation sources. The key abstraction is in `build/src/config.ts` — define source-to-output mappings with glob patterns and line budgets, and the pipeline handles extraction, condensation, and manifest generation.

To create a skill from a different docs repo:

1. Clone the target documentation repository
2. Create a new config mapping source markdown files to output reference files
3. Adjust the SKILL.md template in `generate-skill.ts` for the new domain
4. Run the build pipeline
5. Write test scenarios for the new skill

## License

[MIT](LICENSE) — see [NOTICE](NOTICE) for attribution of the TypeScript documentation source material.
