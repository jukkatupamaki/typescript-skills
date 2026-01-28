# TypeScript Code Review Checklist

## Strict Mode and Type Safety
- Always enable `strict: true` in tsconfig.json
- Never use `any` — prefer `unknown` and narrow with type guards
- Avoid type assertions (`as`) unless unavoidable; prefer type narrowing
- Use `satisfies` operator to validate types without widening
- Enable `noUncheckedIndexedAccess` for safer array/object access

## Type Design
- Prefer discriminated unions over optional properties for state variants
- Use `interface` for object shapes that may be extended, `type` for unions/intersections/mapped types
- Prefer `readonly` properties and `ReadonlyArray` for immutable data
- Use branded types for domain values that shouldn't be interchangeable (e.g., UserId vs OrderId)
- Avoid `enum` in most cases — prefer `as const` objects or union types

## Functions
- Add explicit return types on exported functions
- Use function overloads only when the return type varies by input type
- Prefer generic constraints (`T extends X`) over `any` parameters
- Use `never` for exhaustiveness checks in switch/if-else chains

## Error Handling
- Type catch clause variables as `unknown`, not `any`
- Create typed error classes or discriminated error unions
- Use `Result<T, E>` patterns for expected failures instead of exceptions

## Common Anti-Patterns
- Using `Object`, `Function`, `String` (uppercase) instead of `object`, `Function`, `string`
- Overusing type assertions to silence errors instead of fixing types
- Not narrowing union types before access
- Using `!` non-null assertion without guarantees
- Ignoring `strictNullChecks` errors with optional chaining when null is a real concern
- Using `@ts-ignore` instead of `@ts-expect-error`
- Barrel files that break tree-shaking

## Module Best Practices
- Use `nodenext` module resolution for Node.js projects
- Use `bundler` module resolution for frontend bundler projects
- Prefer explicit file extensions in imports for ESM
- Use `type` imports (`import type { X }`) for type-only imports
- Avoid namespace imports when tree-shaking matters