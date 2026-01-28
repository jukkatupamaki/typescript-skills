/**
 * SKILL.md generator.
 * Creates the main skill file from a template with the current source commit.
 */

export interface SkillGeneratorOptions {
  sourceCommit: string;
  sourceRepo: string;
  refFiles: string[];
}

export function generateSkillMd(options: SkillGeneratorOptions): string {
  const refList = options.refFiles
    .map((f) => `  - refs/${f}`)
    .join("\n");

  return `---
name: typescript
description: >-
  Create, review, and set up TypeScript projects using official TypeScript
  documentation best practices. Use for generating idiomatic TypeScript code,
  reviewing code for type safety issues, or scaffolding new projects with
  correct tsconfig.json configuration.
user-invocable: true
argument-hint: "<create|review|setup> [description]"
---

# TypeScript Skill

Built from [${options.sourceRepo}](https://github.com/${options.sourceRepo}) at commit \`${options.sourceCommit.slice(0, 12)}\`.

## Mode Selection

Parse the arguments to determine mode:
- If arguments start with **create**: generate TypeScript code (see CREATE mode)
- If arguments start with **review**: review TypeScript code in context (see REVIEW mode)
- If arguments start with **setup**: set up a TypeScript project (see SETUP mode)
- If no mode specified: infer from context (existing .ts files → review, no project → setup, otherwise → create)

## Core TypeScript Principles (All Modes)

These principles apply to ALL generated and reviewed code:

1. **Strict mode always**: \`strict: true\` is non-negotiable
2. **No \`any\`**: Use \`unknown\` and narrow with type guards, assertions, or conditional types
3. **Discriminated unions**: Prefer tagged unions over optional properties for variant states
4. **\`interface\` vs \`type\`**: Use \`interface\` for extendable object shapes, \`type\` for unions, intersections, mapped types
5. **Explicit exports**: Add explicit return types on all exported functions
6. **\`const\` assertions**: Use \`as const\` for literal types, \`satisfies\` to validate without widening
7. **Type narrowing**: Prefer \`typeof\`, \`instanceof\`, \`in\`, and custom type predicates over assertions
8. **\`never\` for exhaustiveness**: Use \`never\` in default branches to catch unhandled cases
9. **\`readonly\` by default**: Prefer \`readonly\` properties and \`ReadonlyArray<T>\` for immutable data
10. **Template literal types**: Use for string patterns (event names, API routes, CSS values)
11. **Generic constraints**: Always constrain generics (\`T extends X\`) rather than using \`any\`
12. **Error typing**: Catch as \`unknown\`, create typed error hierarchies or Result types
13. **Module imports**: Use \`import type { X }\` for type-only imports
14. **\`noUncheckedIndexedAccess\`**: Recommend enabling for safer array/object access
15. **Avoid enums**: Prefer \`as const\` objects or string literal unions over \`enum\`

## CREATE Mode

When generating TypeScript code:

1. Read the description from the arguments
2. Load relevant reference files based on the task:
   - Types/narrowing → read \`refs/type-system-core.md\`
   - Functions/classes/generics → read \`refs/functions-and-classes.md\`
   - Advanced types (mapped, conditional, template literal) → read \`refs/type-manipulation.md\`
   - Utility types → read \`refs/utility-types.md\`
   - Modules/imports → read \`refs/modules-and-namespaces.md\`
   - Declaration files → read \`refs/declaration-files.md\`
3. Generate code following these patterns:
   - Use descriptive generic names (\`TItem\`, \`TResult\`) not single letters except for trivial cases
   - Add JSDoc on exported items with \`@param\`, \`@returns\`, \`@example\`
   - Handle edge cases with type narrowing, not assertions
   - Use \`satisfies\` for configuration objects
   - Prefer \`Map\`/\`Set\` over plain objects when keys are dynamic
   - Use \`unknown\` in catch clauses
4. Output complete, compilable TypeScript code (not snippets)

## REVIEW Mode

When reviewing TypeScript code:

1. Read the files in the current working directory or the specified files
2. Load \`refs/code-review-checklist.md\` for the full checklist
3. Check for issues in order of severity:

**Critical** (type safety violations):
- Use of \`any\` (suggest \`unknown\` + narrowing)
- Missing \`strict: true\` in tsconfig
- Type assertions (\`as X\`) hiding real type errors
- \`@ts-ignore\` without justification (suggest \`@ts-expect-error\`)

**Warning** (code quality):
- Missing return types on exported functions
- Enum usage (suggest \`as const\`)
- Non-null assertions (\`!\`) without guarantees
- Missing discriminant in union types
- Barrel files that break tree-shaking

**Info** (improvements):
- \`type\` used where \`interface\` is more appropriate (or vice versa)
- Missing \`readonly\` on data that shouldn't mutate
- Missing \`import type\` for type-only imports
- Opportunities for utility types (\`Partial\`, \`Pick\`, \`Omit\`, etc.)

4. Format the review as:
\`\`\`
## TypeScript Review: [file(s)]

### Critical Issues
- [file:line] Description and fix

### Warnings
- [file:line] Description and fix

### Suggestions
- [file:line] Description and fix

### Summary
[1-2 sentence overall assessment]
\`\`\`

## SETUP Mode

When setting up a TypeScript project:

1. Read the project type from arguments (node, react, library, monorepo, or infer)
2. Load \`refs/project-templates.md\` for tsconfig templates
3. Load \`refs/tsconfig-guide.md\` for option explanations
4. Determine the correct configuration:
   - **Node.js backend**: \`module: "nodenext"\`, \`target: "ES2022"\`
   - **React / bundled frontend**: \`module: "preserve"\`, \`moduleResolution: "bundler"\`
   - **Library**: \`module: "nodenext"\`, \`declaration: true\`, \`declarationMap: true\`
   - **Monorepo**: \`composite: true\`, project references
5. Generate:
   - \`tsconfig.json\` with comments explaining non-obvious options
   - \`src/index.ts\` starter file
   - Relevant \`package.json\` scripts (\`build\`, \`dev\`, \`typecheck\`)
   - \`.gitignore\` additions for TypeScript artifacts
6. Run \`npm install -D typescript\` (or detect existing package manager)
7. Verify setup compiles: \`npx tsc --noEmit\`
`;
}
